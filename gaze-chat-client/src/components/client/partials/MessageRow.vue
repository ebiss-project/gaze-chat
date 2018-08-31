<style>
.message-row {
    width: 100%;
    border-spacing: 0px;
}

.inactive {
    opacity: 0.15;
    transition: opacity 2s ease-in-out;
}

.username {
    font-weight: bold;
}

.time {
    color: rgb(74, 74, 74);
}

.msg {
    text-align: left;
    font-size: 20px;
    line-height: 35px;
    color: #000;
    border-bottom: 1px solid #eee;
    padding-bottom: 7px;
}

.avatar {
    border-radius: 0.25rem;
    width: 45px;
    height: 45px;
}

.avatar-holder {
    text-align: center;
    padding: 17px 0px 0px 0px;
}

.avatar-holder img {
    margin: 0 auto;
}

.message-holder {
    padding: 17px 0px 0px 0px;
}

.unseen {
}

.user-row {
    line-height: 16px;
}

.user-row i.fa-envelope {
    color: black;
}

.user-row i.fa-envelope-open {
    color: rgb(120, 120, 120);
}

.user-row i.fa-check {
    color: rgb(120, 120, 120);
}

.controls {
    float: right;
    opacity: 0.15;
    cursor: pointer;
}

.glimpse {
    opacity: 0.5;
}

.message-row:hover .controls {
    float: right;
    opacity: 1;
}

.perception {
    width: 42px;
    padding: 0px !important;
}
</style>

<template>

    <table class="message-row animated fadeIn" v-bind:class="{ unseen: !seen }" ref="el">
        <tr>
            <td width="14" style="padding:0px;text-align:center;opacity:0.7;">
                <rai :rai-width="'10px'" :init-read="uid == message.uid" :ref="'rai-'+uid" :id="message.mid+'-'+uid" :prev-id="prevMid != null ? prevMid+'-'+uid : null" :next-id="nextMid != null ? nextMid+'-'+uid : null" :color="userList[uid].color"></rai>
            </td>
            <td width="70" class="avatar-holder" valign="top">
                <img v-bind:src="'/static/avatars/'+userList[message.uid].picture+'.png'" class="avatar">
            </td>
            <td class="message-holder">
                <div class="user-row">
                    <span class="badge badge-info" :style="{background: userList[message.uid].color}">{{ userList[message.uid].username }}</span>
                    <span class="time badge badge-default">{{ message.serverTS | formatMessageTS}}</span>
                </div>
                <div class="msg" v-bind:data-uid="message.uid" v-bind:data-mid="message.mid" v-bind:id="'msg-'+message.mid">
                    <gazetext :locked="locked" ref="gazetext" :message="message.text" :mid="message.mid" v-on:read="markAsReadOnFinish" v-on:seen="markAsSeen" v-on:fixation="sendReadingSignal(message.mid)"></gazetext>
                </div>
            </td>
            <template v-for="(u, index) in readingStatusList">
                <template v-if="index != uid">
                    <td class="perception" :ref="u.uid" :style="'width:'+(userList[u.uid].username.length*10)+'px;'">
                        <rai :rai-width="'10px'" :init-read="u.uid == message.uid" :ref="'rai-'+u.uid" :id="message.mid+'-'+u.uid" :prev-id="prevMid != null ? prevMid+'-'+u.uid : null" :next-id="nextMid != null ? nextMid+'-'+u.uid : null" :color="userList[u.uid].color"></rai>
                    </td>
                </template>
            </template>
        </tr>
    </table>

</template>

<script>
import ReadingAwarenessIndicator from "@/components/client/partials/ReadingAwarenessIndicator";
import GazeText from "@/components/gaze/GazeText";
import Spinner from "vue-simple-spinner";
import moment from "moment";
import { globalVars } from "@/global-vars.js";

export default {
    mounted: function() {
        this.minFixationCountForAnimationBegin =
            this.$refs.gazetext.getChars() <= globalVars.stroopCharacterThreshold ? globalVars.readingAnimationFixationCountThresholdStroop : globalVars.readingAnimationFixationCountThreshold;
    },
    created: function() {
        this.updateReadingStatusList(this.userList);
        this.readingStatusList[this.message.uid].state = "read";
        if (this.message.uid == this.uid) {
            this.seen = true;
            this.read = true;
        }
    },
    components: {
        gazetext: GazeText,
        "vue-simple-spinner": Spinner,
        rai: ReadingAwarenessIndicator
    },
    name: "message-row",
    props: ["userList", "message", "prevMid", "nextMid", "uid"],
    watch: {
        userList: function(value) {
            this.updateReadingStatusList(value);
        },
        read: function(newVal) {
            if (this.message.uid != this.uid && newVal) {
                this.$socketChatServer.emit("change message gaze state", {
                    mid: this.message.mid,
                    uid: this.uid,
                    state: "read"
                });
                this.$refs["rai-" + this.uid].markAsRead();
            }
        },
        seen: function(newVal) {
            if (this.message.uid != this.uid && newVal) {
                this.$socketChatServer.emit("change message gaze state", {
                    mid: this.message.mid,
                    uid: this.uid,
                    state: "seen"
                });
                this.$refs["rai-" + this.uid].markAsSeen();
                this.$emit("seen", {
                    mid: this.message.mid,
                    uid: this.uid
                });
            }
        }
    },
    data() {
        return {
            seen: false,

            read: false,
            readPending: false,
            readPendingTimer: null,

            spinnerTimeout: 500,
            readingStatusList: {},
            readingToggle: false,
            readingToggleIntvTimer: null,
            isInactive: false,

            locked: globalVars.lockMessages,

            minFixationCountForAnimationBegin: 1
        };
    },
    filters: {
        formatMessageTS: function(value) {
            return moment(value).format("HH:mm");
        }
    },
    methods: {
        unseenTop: function() {
            var el = this.$refs.el.parentNode;
            var container = el.parentNode;

            var ulHoeheIngesamt = container.scrollHeight;
            var sichtbarVon = container.scrollTop;
            var sichtbarBis = sichtbarVon + container.clientHeight;
            var sichtbarHoehe = sichtbarBis - sichtbarVon;
            var liPositionTop = el.offsetTop;
            var liPositionBottom = liPositionTop + el.scrollHeight;

            if (liPositionBottom <= sichtbarVon && !this.seen) {
                return liPositionTop;
            }
            return -1;
        },
        unseenBottom: function() {
            var el = this.$refs.el.parentNode;
            var container = el.parentNode;

            var ulHoeheIngesamt = container.scrollHeight;
            var sichtbarVon = container.scrollTop;
            var sichtbarBis = sichtbarVon + container.clientHeight;
            var sichtbarHoehe = sichtbarBis - sichtbarVon;
            var liPositionTop = el.offsetTop;
            var liPositionBottom = liPositionTop + el.scrollHeight;

            if (liPositionTop >= sichtbarBis && !this.seen) {
                return liPositionTop;
            }
            return -1;
        },
        markAsSeen: function() {
            this.seen = true;
        },
        markAsReadOnFinish: function() {
            this.readPending = true;
        },
        readingSignalUid: function(uid) {
            // Called by parent component
            this.readingStatusList[uid].signalCountTotal++;
            this.readingStatusList[uid].signalCountTemp++;

            // Switch to seen if not seen or read
            if (!this.readingStatusList[uid].state != "seen" && this.readingStatusList[uid].state != "read") {
                this.$refs["rai-" + uid][0].markAsSeen();
                this.readingStatusList[uid].state = "seen";
            }

            clearTimeout(this.readingStatusList[uid].readingGapTimeout);
            this.readingStatusList[uid].readingGapTimeout = setTimeout(() => {
                this.readingStatusList[uid].signalCountTemp = 0;
            }, 500);

            // Check for signal threshold
            if (this.readingStatusList[uid].signalCountTemp >= this.minFixationCountForAnimationBegin) {
                if (!this.readingStatusList[uid].reading) {
                    this.readingStatusList[uid].reading = true;
                    this.$refs["rai-" + uid][0].startReading();
                }

                // Animate FadeOut
                clearTimeout(this.readingStatusList[uid].fadeOutTimer);
                this.readingStatusList[uid].fadeOutTimer = setTimeout(() => {
                    this.readingStatusList[uid].reading = false;
                    this.$refs["rai-" + uid][0].stopReading();
                }, this.spinnerTimeout);
            }
        },
        sendReadingSignal: function(mid) {
            clearTimeout(this.readPendingTimer);
            this.$socketChatServer.emit("is reading", {
                mid: mid,
                uid: this.uid
            });
            this.readPendingTimer = setTimeout(() => {
                if (this.readPending) {
                    this.read = true;
                }
            }, this.spinnerTimeout);
        },
        updateReadingStatusList: function(value) {
            this.readingStatusList = {};
            for (var u in value) {
                this.$set(this.readingStatusList, u, {
                    uid: u,
                    state: "none",
                    reading: false,
                    readingGapTimeout: null,
                    readingToggledOnce: false,
                    signalCountTemp: 0,
                    signalCountTotal: 0,
                    fadeOutTimer: null
                });
            }
        },
        changeMessageGazeState: function(data) {
            this.readingStatusList[data.uid].state = data.state;
            if (data.state == "seen") {
                this.$refs["rai-" + data.uid][0].markAsSeen();
            }
            if (data.state == "read") {
                this.$refs["rai-" + data.uid][0].markAsRead();
            }
        }
    }
};
</script>
