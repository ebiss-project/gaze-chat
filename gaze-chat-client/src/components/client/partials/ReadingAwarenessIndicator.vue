<style>
.rai-holder {
    height: 0%;
    margin: 0 auto;
    border: 1px solid transparent;
    border-radius: 6px;
    vertical-align: top;
    opacity: 0.6;
}
</style>

<template>

    <div class="rai-holder" ref="rai" :title="title">
    </div>

</template>

<script>
import { EventBus } from "@/event-bus.js";
import anime from "animejs";
import { hexToRGB, shadeBlendConvert } from "@/helper/color-helper.js";

export default {
    created: function() {
        EventBus.$on("raiRead", data => {
            if (this.read && this.prevId == data.id) {
                this.connectTop();
            }
            if (this.read && this.nextId == data.id) {
                this.connectBottom();
            }
        });
        EventBus.$on("raiConnectedTop", data => {
            if (this.read && this.nextId == data.id) {
                this.connectBottom();
            }
        });
        EventBus.$on("raiConnectedBottom", data => {
            if (this.read && this.prevId == data.id) {
                this.connectTop();
            }
        });
    },
    mounted: function(e) {
        // Set fixed height on mounted, otherwise height: 100% does not work
        this.$refs.rai.parentElement.height = this.$refs.rai.parentElement.clientHeight;
        this.$refs.rai.parentElement.style.verticalAlign = "top";

        this.$refs.rai.style.borderColor = this.color;
        this.$refs.rai.style.width = this.raiWidth;

        this.baseColor = this.color;
        this.fromColor = shadeBlendConvert(0.9, this.color);
        this.fromColorRead = shadeBlendConvert(1, this.color);
        this.toColor = shadeBlendConvert(0, this.color);
        this.seenColor = shadeBlendConvert(0.7, this.color);
        this.readColor = shadeBlendConvert(0, this.color);

        if (this.initRead) {
            this.$refs.rai.parentNode.dataset.aoiName = "read";
            this.markAsReadAnimation(0);
            this.read = true;
            this.seen = true;
        } else {
            this.$refs.rai.style.backgroundColor = this.baseColor;
        }

        // Animate to full height
        anime({
            targets: this.$refs.rai,
            height: "100%",
            duration: 400,
            easing: "linear"
        });
    },
    name: "ReadingAwarenessIndicator",
    props: ["id", "prevId", "nextId", "color", "initRead", "raiWidth"],
    data() {
        return {
            title: "Benutzer hat diesen Beitrag noch nicht gesehen",
            baseColor: null,
            fromColor: null,
            toColor: null,
            seenColor: null,

            seen: false,
            read: false,
            reading: false,
            stopReadingSignal: false,

            resetAnimation: null,
            seenAnimation: null,
            readingAnimation: null,
            readAnimation: null,

            connectedTop: false,
            connectedBottom: false,

            readColor: "#FFFFFF"
        };
    },
    watch: {
        read: function(newVal) {
            if (newVal) {
                // Emit event for possible connection!
                EventBus.$emit("raiRead", {
                    id: this.id
                });
            }
        }
    },
    methods: {
        markAsSeen: function() {
            if (this.seen || this.read) return;
            this.seen = true;
            this.title = "Benutzer hat diesen Beitrag gesehen";

            // Leave BGColor untouched if in reading mode
            if (!this.reading) {
                this.seenAnimation = anime({
                    targets: this.$refs.rai,
                    backgroundColor: this.seenColor,
                    duration: 250,
                    easing: "linear"
                });
            }
        },
        markAsRead: function() {
            if (this.read) return;
            this.read = true;

            // Leave BGColor untouched if in reading mode
            if (!this.reading) {
                if (this.seenAnimation) {
                    this.seenAnimation.finished.then(this.markAsReadAnimation);
                    return;
                }
                this.markAsReadAnimation();
            }
        },
        markAsReadAnimation: function(duration) {
            this.title = "Benutzer hat diesen Beitrag gelesen";
            this.$refs.rai.parentNode.dataset.aoiName = "read";

            this.readAnimation = anime({
                targets: this.$refs.rai,
                width: "2px",
                borderWidth: "0px",
                borderRadius: "0px",
                backgroundColor: this.readColor,
                duration: duration == undefined ? 150 : duration,
                easing: "linear"
            });
        },
        startResetAnimation: function() {
            this.resetAnimation = anime({
                targets: this.$refs.rai,
                backgroundColor: this.read ? this.fromColorRead : this.fromColor,
                duration: 250,
                easing: "linear"
            });
        },
        startReading: function() {
            if (this.reading) return;

            if (this.seenAnimation) {
                this.seenAnimation.pause;
            }

            this.seen = true;

            this.startResetAnimation();
            this.resetAnimation.finished.then(this.startReadingAnimation);
        },
        stopReading: function() {
            if (this.reading) this.stopReadingSignal = true;
        },
        startReadingAnimation: function() {
            this.$refs.rai.parentNode.dataset.aoiName = !this.read ? "reading" : "rereading";
            this.readingAnimation = anime({
                targets: this.$refs.rai,
                backgroundColor: !this.read ? this.baseColor : this.toColor,
                easing: "easeInOutQuad",
                duration: 500,
                direction: "alternate",
                loop: true,
                begin: anim => {
                    this.reading = true;
                },
                run: anim => {
                    if (this.stopReadingSignal) {
                        if (this.read && anim.progress == 0) {
                            anim.pause();
                            this.reading = false;
                            this.stopReadingSignal = false;
                            this.markAsReadAnimation();
                            this.$refs.rai.parentNode.dataset.aoiName = "read";
                        }

                        // If not completely read => back to seenColor
                        if (!this.read && Math.round(anim.progress) == 30) {
                            anim.pause();
                            this.reading = false;
                            this.stopReadingSignal = false;
                            this.$refs.rai.parentNode.dataset.aoiName = "seen";
                        }
                    }
                }
            });
        },
        connectTop: function() {
            return;
            if (this.connectedTop) return;
            this.connectedTop = true;
            EventBus.$emit("raiConnectedTop", {
                id: this.id
            });
            anime({
                targets: this.$refs.rai,
                duration: 500,
                easing: "linear",
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderTopColor: "#FFFFFF",
                complete: anim => {
                    this.$refs.rai.style.borderTop = "0px";
                }
            });
        },
        connectBottom: function() {
            return;
            if (this.connectedBottom) return;
            this.connectedBottom = true;
            EventBus.$emit("raiConnectedBottom", {
                id: this.id
            });
            anime({
                targets: this.$refs.rai,
                duration: 500,
                easing: "linear",
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderBottomColor: "#FFFFFF",
                complete: anim => {
                    this.$refs.rai.style.borderBottom = "0px";
                }
            });
        }
    }
};
</script>
