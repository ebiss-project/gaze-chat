<style scoped>
.read {
}
</style>

<template>

    <div>
        <div class="wordmatrix" v-gaze-enabled:active="{aoiId: mid, aoiName: 'gazetext'}">
            <template v-for="(l, row) in wordMatrix">
                <template v-if="Object.keys(l[0]).length === 0">
                    <!-- <br> -->
                </template>
                <template v-else>
                    <div class="line">
                        <template v-for="(w, col) in l">
                            <span class="word" :class="w.read ? 'read' : ''" v-gaze-enabled:passive="{aoiId: mid, aoiType: 'word', aoiName: 'word', aoiData: {c: col, r:row}}" v-html="w.text+(w.concat || col==l.length-1 ? '' : ' ')"></span>
                        </template>
                    </div>
                </template>
            </template>
        </div>
        <div ref="origMessageHolder" v-if="wordMatrix.length == 0"></div>
    </div>

</template>

<script>
import { EventBus } from "@/event-bus.js";
import { globalVars } from "@/global-vars.js";

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export default {
    name: "GazeText",
    props: ["mid", "message", "locked"],
    data() {
        return {
            maxWordLength: 14,
            cutLength: 8,
            includeRemaining: 3,
            chars: 0,
            words: 0,
            lines: 0,
            fixations: 0,
            fixationToCharacterRatio: 0.1,
            read: false,
            seen: false,
            wordMatrix: [], // will be filled in mounted lifecycle hook
            seenCounter: 0,
            readingIntvFixationCounter: 0,
            firstReading: false,
            lastestReading: false,
            readingTimeout: null,
            readSend: false
        };
    },
    watch: {
        fixations: function(newFixations) {
            this.$emit("fixation");
            if (!this.read && this.chars * this.fixationToCharacterRatio <= this.fixations && this.readPercentage > 0.7) {
                this.read = true;
                this.$emit("read");
            }
            if (!this.seen) {
                this.seen = true;
                this.$emit("seen");
            }

            if (!this.firstReading) {
                this.seenCounter++;
                this.firstReading = Date.now() - globalVars.minFixationDuration;
                this.lastestReading = this.firstReading + globalVars.minFixationDuration;
                this.$socketChatServer.emit("event or state", "seen message", {
                    mid: this.mid,
                    seenCounter: this.seenCounter,
                    FLength: globalVars.minFixationDuration
                });
            } else {
                clearTimeout(this.readingTimeout);
                this.lastestReading = Date.now();
            }
            this.readingIntvFixationCounter++;
            this.readingTimeout = setTimeout(() => {
                this.readingTimeout = null;
                this.closeReadingInterval();
            }, 1000);
        }
    },
    methods: {
        getChars: function() {
            return this.chars;
        },
        closeReadingInterval: function() {
            // Dont classify as Reading Interval if only 1 fixation....
            if (this.readingIntvFixationCounter >= globalVars.readingIntervalFixationCountThreshold) {
                this.$socketChatServer.emit("event or state", "reading message", {
                    mid: this.mid,
                    duration: this.lastestReading - this.firstReading,
                    timeDiff: Date.now() - this.lastestReading,
                    fixationCount: this.readingIntvFixationCounter
                });
            }
            if (this.read && !this.readSend) {
                this.readSend = true;
                this.$socketChatServer.emit("event or state", "read message", {
                    mid: this.mid,
                    timeDiff: Date.now() - this.lastestReading
                });
            }
            this.firstReading = false;
            this.lastestReading = false;
            this.readingIntvFixationCounter = 0;
        }
    },
    computed: {
        wordCoverage: function() {
            var wordsRead = 0;
            for (var i = 0; i < this.lines; i++) {
                wordsRead += this.wordMatrix[i].filter(w => w.read).length;
            }
            return parseFloat((wordsRead / this.words).toFixed(2));
        },
        readPercentage: function() {
            var wordsRead = 0;
            for (var i = 0; i < this.lines; i++) {
                wordsRead += this.wordMatrix[i].filter(w => w.read).length;
            }
            return parseFloat((wordsRead / this.words).toFixed(2));
        }
    },
    created: function() {
        var el = this;
        EventBus.$on("gazetext", data => {
            if (this.locked == true) return;

            if (data.receiverEl.aoiId == el.mid) {
                var foundWordInHitDetection = false;
                for (var i = 0; i < data.passiveList.length; i++) {
                    if (data.passiveList[i].el.aoiName == "word") {
                        var payload = JSON.parse(data.passiveList[i].el.aoiData);
                        el.wordMatrix[parseInt(payload.r)][parseInt(payload.c)].read = true;
                        foundWordInHitDetection = true;
                    }
                }
                if (foundWordInHitDetection) {
                    el.fixations++;
                } else {
                    // Close Reading Interval immediately if open
                    if (this.readingTimeout != null) {
                        clearTimeout(this.readingTimeout);
                        this.readingTimeout = null;
                        this.closeReadingInterval();
                    }
                }
            } else {
                // Close Reading Interval immediately if open
                if (this.readingTimeout != null) {
                    clearTimeout(this.readingTimeout);
                    this.readingTimeout = null;
                    this.closeReadingInterval();
                }
            }
        });
    },
    mounted: function() {
        var el = this.$refs.origMessageHolder;
        var tempWordMatrix = [];

        // Helper Function: get offset of element
        function getOffset(el) {
            let rect = el.getBoundingClientRect();
            return {
                top: rect.top + document.body.scrollTop,
                left: rect.left + document.body.scrollLeft
            };
        }

        // Helper Function: insert element after referenceNode
        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }

        // Create line and word spans for this text...
        var lineCounter = 0;
        var forcedLineBreaks = this.message.split("\n");
        for (var i = 0; i < forcedLineBreaks.length; i++) {
            var block = forcedLineBreaks[i];

            let wordsOriginal = block.split(" ");
            let words = [];

            let out = "";

            for (let i in wordsOriginal) {
                var w = wordsOriginal[i];
                var len = w.length;
                if (len > this.maxWordLength) {
                    // Max allowed chars per word
                    var loopsToMake = Math.ceil(len / this.cutLength);
                    var remainingChars = len % this.cutLength;

                    if (remainingChars > 0 && remainingChars <= this.includeRemaining) {
                        loopsToMake--;
                    }
                    for (var cutter = 0; cutter < loopsToMake; cutter++) {
                        var addClass = "";
                        if (cutter == loopsToMake - 1) {
                            var partialWord = w.substring(cutter * this.cutLength, (cutter + 1) * this.cutLength + remainingChars);
                        } else {
                            var addClass = " concat";
                            var partialWord = w.substring(cutter * this.cutLength, (cutter + 1) * this.cutLength);
                        }
                        words.push(partialWord);
                        this.chars += partialWord.length;
                        out += '<span class="word' + addClass + '">' + escapeHtml(partialWord) + " </span>";
                        this.words++;
                    }
                } else {
                    // Short enough - only one word
                    words.push(w);
                    this.chars += w.length;
                    out += '<span class="word">' + escapeHtml(w) + " </span>";
                    this.words++;
                }
            }

            el.innerHTML += out;

            if (i != forcedLineBreaks.length - 1) {
                el.innerHTML += '<span class="word br"></span>';
            }
        }

        let wordSpans = el.querySelectorAll("span.word");

        // Create first line and add first word
        let line = document.createElement("div");
        line.classList.add("line");
        el.insertBefore(line, wordSpans[0]);
        line.appendChild(wordSpans[0]);

        tempWordMatrix[lineCounter] = [];
        tempWordMatrix[lineCounter].push({
            read: false,
            concat: wordSpans[0].classList.contains("concat"),
            text: wordSpans[0].innerHTML.trim()
        });

        // Append other words and create lines if neccessary
        for (let i = 1; i < wordSpans.length; i++) {
            // Check if forced line breaks
            if (wordSpans[i].classList.contains("br")) {
                wordSpans[i].parentNode.removeChild(wordSpans[i]);
                // Add new line
                lineCounter++;
                tempWordMatrix[lineCounter] = [];
                tempWordMatrix[lineCounter].push({});
                lineCounter++;
                tempWordMatrix[lineCounter] = [];
                let newLine = document.createElement("div");
                newLine.classList.add("line");
                let allLines = el.querySelectorAll("div.line");
                insertAfter(newLine, allLines[allLines.length - 1]);
                continue;
            }

            // Last line
            let allLines = el.querySelectorAll("div.line");
            let currentLine = allLines[allLines.length - 1];

            // Always add word...
            currentLine.appendChild(wordSpans[i]);

            // ... and check if same offset?
            if (currentLine.children.length > 1 && getOffset(currentLine.children[currentLine.children.length - 1]).top !== getOffset(currentLine.children[currentLine.children.length - 2]).top) {
                // if not: Create a new line and move this word to that line
                lineCounter++;
                tempWordMatrix[lineCounter] = [];
                let newLine = document.createElement("div");
                newLine.classList.add("line");
                newLine.appendChild(wordSpans[i]);
                insertAfter(newLine, currentLine);
            }

            // Add to wordMatrix
            tempWordMatrix[lineCounter].push({
                read: false,
                concat: wordSpans[i].classList.contains("concat"),
                text: wordSpans[i].innerHTML.trim()
            });
        }

        // Needs to be set completely, otherwise loses VueJS data binding
        this.wordMatrix = tempWordMatrix;

        this.lines = lineCounter + 1;
    }
};
</script>
