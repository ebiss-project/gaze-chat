<style>
body {
    height: 100vh !important;
    overflow: hidden;
}
</style>

<style scoped>
.lfb-badge {
    font-size: 12px;
    overflow: hidden;
}

.avatar-reading-status {
    width: 40px;
    height: 40px;
    margin-bottom: -14px;
    border-radius: 5px;
}

.messages-wrap {
    margin: 0 auto;
    position: relative;
    background: #fff;
}

ul.messages {
    margin: 0px;
    padding: 0px 30px 25px 40px;
    width: 100%;
    position: absolute;
    bottom: 0px;
    text-align: left;
    overflow: overlay;
}

.topshadow {
}

ul.messages li {
    list-style-type: none;
}

textarea {
    width: 100%;
    height: 75px;
    border-radius: 5px;
    border: 2px solid #888;
    font-size: 20px;
    padding: 5px;
}

textarea:hover,
input:hover,
textarea:active,
input:active,
textarea:focus,
input:focus,
button:focus,
button:active,
button:hover,
label:focus,
.btn:active,
.btn.active {
    outline: 0px !important;
}

.is-typing-holder {
    margin-top: 10px;
    margin-bottom: 20px;
}

.today {
    text-align: center;
    width: 220px;
    font-weight: bold;
}

#unread-notification {
    cursor: pointer;
    position: absolute;
    width: 35px;
    padding: 5px 5px 5px 5px;
    text-align: center;
    font-size: 16px;
    margin-left: 5px;
    margin-top: 4px;
    z-index: 9;
    color: white;
    box-shadow: 0px 8px 6px -6px #444;
    border-radius: 10px;
    font-weight: bold;
}

#unread-notification .triangle {
    width: 0;
    height: 0;
    border-top: 0px solid transparent;
    border-bottom: 20px solid transparent;
    border-left: 13px solid transparent;
    position: absolute;
    margin-left: 25px;
    margin-top: -3px;
    transform: skewY(162deg);
}

#unread-notification-bottom {
    cursor: pointer;
    position: absolute;
    width: 35px;
    padding: 5px 5px 5px 5px;
    text-align: center;
    font-size: 16px;
    margin-left: 5px;
    margin-top: -42px;
    z-index: 9;
    color: white;
    box-shadow: 0px 8px 6px -6px #444;
    border-radius: 10px;
    font-weight: bold;
}

#unread-notification-bottom .triangle {
    width: 0;
    height: 0;
    border-top: 20px solid transparent;
    border-bottom: 0px solid transparent;
    border-left: 18px solid transparent;
    position: absolute;
    margin-left: 20px;
    margin-top: 8px;
    transform: skewY(20deg);
}

.timer-active {
    background-color: #aaa;
}

.gaze-missing-border {
    position: absolute;
    top: 0px;
    left: 0px;
    border: 4px solid rgba(220, 0, 0, 1);
    height: 100vh;
    width: 100vw;
    overflow: hidden !important;
    z-index: 51;
    pointer-events: none;
    opacity: 0;
}
.header {
    background-color: #eee;
    border-bottom: 1px solid #ddd;
    border-top: 1px solid #ddd;
}
.header > div {
    padding-top: 13px;
    text-align: center;
    height: 83px;
}
.header > div > table {
    width: 100%;
    height: 26px;
    z-index: 9;
    position: relative;
    margin-bottom: -8px;
}
.footer {
    background-color: #eee;
    padding-top: 15px;
}
.alerts {
    position: absolute;
    width: 100%;
    top: 100px;
    z-index: 1000000;
}
</style>

<template>

    <div class="container-fluid">

        <div class="gaze-missing-border" ref="gazemissingborder"></div>

        <GazeDebug></GazeDebug>

        <div class="row alerts">
            <div class="col-lg-12">
                <div class="alert alert-danger" role="alert" v-if="!connectedToGazeForwarder">
                    No connection to gaze data source!
                </div>
                <div class="alert alert-warning" role="alert" v-if="reconnectingToGazeForwarder > 0">
                    Trying to connect to gaze data source... {{reconnectingToGazeForwarder}}
                </div>
                <div class="alert alert-danger" role="alert" v-if="!connectedToServer">
                    No connection to the chat server!
                </div>
                <div class="alert alert-warning" role="alert" v-if="reconnectingToServer > 0">
                    Trying to connect to the chat server... {{reconnectingToServer}}
                </div>
            </div>
        </div>

        <div class="row header" style="">
            <div ref="header" class="col-lg-12">
                <b style="font-size:larger;">Ebiss Gaze Chat</b><br>
                <template v-for="(u, index) in userList">
                    <span style="color:green;">&#9679;</span> {{ u.username }}
                    <template v-if="index == uid">(you) </template>
                </template>

                <table class="animated slideInUp" v-if="scrolling && chat == 'gc'">
                    <tr>
                        <td title="Your reading progress bar" style="text-align:left;">
                            <span class="badge badge-info lfb-badge" :style="{background: color}" style="margin-left:11px;width:40px;">You</span>
                        </td>
                        <td></td>
                        <template v-for="(u, index) in userList">
                            <template v-if="index != uid">
                                <td :style="'width:'+(u.username.length*10)+'px;text-align:center;padding:0px;'" :title="u.username+'s reading progress'">
                                    <span class="badge badge-info lfb-badge" :style="{background: u.color}">{{ u.username }}</span>
                                </td>
                            </template>
                        </template>
                        <td width="15"></td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-12" style="padding-left:0px;padding-right:0px;">

                <a v-on:click.stop.prevent="unreadScrollTop" v-if="showMissedMessagesTop" title="unseen messages">
                    <div id="unread-notification" :style="'background-color:'+bubbleColor" class="animated" :class="missedMessagesTop > 0 ? 'fadeIn' : 'fadeOut'">
                        <div class="triangle" :style="'border-left-color:'+bubbleColor"></div>
                        <table style="margin:0 auto;" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="width:80px;text-align:center;">{{missedMessagesTop}}</td>
                            </tr>
                        </table>
                    </div>
                </a>

                <div class="messages-wrap" ref="chatlog">
                    <ul class="messages" ref="messages" :class="scrolling ? 'topshadow' : ''">
                        <li class="animated fadeIn">
                            <table width="100%">
                                <tr>
                                    <td><hr></td>
                                    <td class="today">{{todayLong}}</td>
                                    <td><hr></td>
                                </tr>
                            </table>
                        </li>
                        <li v-if="messages.length == 0" class="animated fadeIn">
                            <table width="100%">
                                <tr>
                                    <td style="text-align:center;">
                                        no messages
                                    </td>
                                </tr>
                            </table>
                        </li>
                        <li v-if="!scrolling && messages.length > 0" class="animated fadeIn">
                            <table width="100%" height="20" style="margin-bottom: -7px;">
                                <tr>
                                    <td title="Your reading progress bar">
                                        <span class="badge badge-info lfb-badge" :style="{background: color}" style="margin-left:-14px;width:40px;">You</span>
                                    </td>
                                    <td style="text-align:right;"></td>
                                    <template v-for="(u, index) in userList">
                                        <template v-if="index != uid">
                                            <td :style="'width:'+(u.username.length*10)+'px;text-align:center;padding:0px;'" :title="u.username+'s reading progress'">
                                                <span class="badge badge-info lfb-badge" :style="{background: u.color}">{{ u.username }}</span>
                                            </td>
                                        </template>
                                    </template>
                                </tr>
                            </table>
                        </li>
                        <li v-for="(m,index) in messages" v-scroll-to-bottom>
                            <message-row :ref="'message-'+m.mid" v-on:seen="markMessageAsSeen" :message="m" :user-list="userList" :uid="uid" :prev-mid="messages[index-1] != undefined ? messages[index-1].mid : null" :next-mid="messages[index+1] != undefined ? messages[index+1].mid : null"></message-row>
                        </li>
                    </ul>
                </div>

                <a v-on:click.stop.prevent="unreadScrollBottom" v-if="missedMessagesBottom" title="unseen messages">
                    <div id="unread-notification-bottom" :style="'background-color:'+bubbleColor" class="animated" :class="missedMessagesBottom > 0 ? 'fadeIn' : 'fadeOut'">
                        <div class="triangle" :style="'border-left-color:'+bubbleColor"></div>
                        <table style="margin:0 auto;" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="width:80px;text-align:center;">{{missedMessagesBottom}}</td>
                            </tr>
                        </table>
                    </div>
                </a>

            </div>
        </div>

        <div ref="footer" class="row footer">
            <div class="col-lg-12">
                <textarea @click="textinputClick" spellcheck="false" ref="textinput" v-model="message" placeholder="Text input..." v-on:keydown="keyDownFunc" v-on:keyup="keyUpFunc" :class="inputTimer != null ? 'timer-active' : ''"></textarea>
            </div>
            <div class="col-lg-12 is-typing-holder">
                <is-typing-notification ref="istypingnotification" :user-list="userList" :uid="uid"></is-typing-notification>
            </div>
        </div>
    </div>

</template>

<script>
import moment from "moment";
import anime from "animejs";
import GazeDebug from "@/components/gaze/GazeDebug";
import MessageRow from "./partials/MessageRow";
import IsTypingNotification from "./partials/IsTypingNotification";
import { hexToRGB, shadeBlendConvert } from "@/helper/color-helper.js";
import { globalVars } from "@/global-vars.js";
import SocketMixin from "@/mixin/SocketMixin";
import FixationFilter from "@/gaze/fixation-filter.js";
import HitDetection from "@/gaze/hit-detection.js";

export default {
    mixins: [SocketMixin],
    components: {
        MessageRow,
        IsTypingNotification,
        GazeDebug
    },
    name: "client",
    props: ["username", "picture", "color"],
    created: function() {
        document.title = "Chat | Joined as : " + this.username;

        // Register user on the server (if reconnecting with same data, server will take care of that)
        this.$socketChatServer.emit("add user", {
            uid: this.uid,
            username: this.username,
            picture: this.picture,
            color: this.color
        });

        // Receive the UID assigned by the server
        this.$socketChatServer.on("login", data => {
            this.uid = data.uid;
            this.$log.debug("User ID assigned was: " + this.uid);
        });

        // Receive user list from the server
        this.$socketChatServer.on("user list", userList => {
            this.userList = userList;
        });

        // Handle incoming message
        this.$socketChatServer.on("new message", msg => {
            this.messages.push(msg);
            this.$refs.istypingnotification.interruptUid(msg.uid);
        });

        // Handle is-typing notification
        this.$socketChatServer.on("is typing", data => {
            this.$refs.istypingnotification.signalUid(data.uid);
        });

        // Handle is-reading notification
        this.$socketChatServer.on("is reading", data => {
            this.$refs["message-" + data.mid][0].readingSignalUid(data.uid);
        });

        // Handle change message gaze state
        this.$socketChatServer.on("change message gaze state", data => {
            this.$log.debug("change message gaze state: ", data);
            this.$refs["message-" + data.mid][0].changeMessageGazeState(data);
        });

        var hd = new HitDetection();
        var fixationFilter = new FixationFilter();
        if (this.$socketGazeForwarder._callbacks.$raw === undefined) {
            this.$socketGazeForwarder.on("raw", data => {
                hd.calcWindowBasedOffsets();

                // Correct the gaze data coordinates to window position and viewport-to-border offsets
                globalVars.gcRawX = data.X += globalVars.gazeOffsetX - hd.absX;
                globalVars.gcRawY = data.Y += globalVars.gazeOffsetX - hd.absY;

                // Start: gaze missing signal if no gaze in chat window
                if (data.X < 0 || data.X > document.body.clientWidth || data.Y < 0 || data.Y > document.body.clientHeight) {
                    // Optional handling of: gaze out of bounds
                } else {
                    this.$refs["gazemissingborder"].style.opacity = "0";
                    this.$refs["gazemissingborder"].classList.remove("animated", "fadeIn");

                    clearTimeout(this.gazeMissingTimer);
                    this.gazeMissingTimer = setTimeout(() => {
                        this.$refs["gazemissingborder"].classList.add("animated", "fadeIn");
                        this.$refs["gazemissingborder"].style.opacity = "1";
                    }, globalVars.gazeFeedbackErrorTimeout);
                }
                // End: Gaze missing signal

                // Add raw data to fixation filter
                var f = fixationFilter.tryAddGazeData(data);
                if (f != null && f.earlyFlag) {
                    globalVars.gcFBeginX = f.X;
                    globalVars.gcFBeginY = f.Y;
                }
            });
        }
    },
    mounted: function() {
        // Auto focus text input
        this.$refs["textinput"].focus();
        // Check for unseen messages outside the viewport on every scroll event
        this.$refs["messages"].addEventListener("scroll", () => {
            this.refreshUnseenMessagesCount();
        });

        // Set chat log height to remaining viewport height on init and after every window resize
        this.setChatLogHeight();
        window.addEventListener("resize", () => {
            this.setChatLogHeight();
        });
    },
    data() {
        return {
            uid: -1,
            message: "",
            userList: {},
            messages: [],
            scrolling: false,
            missedMessagesTop: 0,
            missedMessagesBottom: 0,
            showMissedMessagesTop: false,
            showMissedMessagesBottom: false,
            inputTimer: null,
            isTyping: false,
            gazeMissingTimer: null
        };
    },
    computed: {
        bubbleColor: function() {
            return shadeBlendConvert(0.2, this.color);
        },
        todayLong: function() {
            return moment().format("dddd, DD. MMMM");
        }
    },
    directives: {
        // Auto scrolls to bottom when new messages arrive, does not if scrolled up
        scrollToBottom: {
            inserted: function(el, bindings, vnode) {
                const vm = vnode.context;
                var msgs = vm.$refs.messages;
                var ulHeightTotal = msgs.scrollHeight;
                var visibleFrom = msgs.scrollTop;
                var visibleTo = visibleFrom + msgs.clientHeight;
                var notVisibleBottom = ulHeightTotal - visibleTo;
                if (notVisibleBottom < 350 && ulHeightTotal > msgs.parentNode.clientHeight) {
                    msgs.scrollTop = msgs.scrollHeight;
                    vm.scrolling = true;
                }
                vm.refreshUnseenMessagesCount();
            }
        }
    },
    methods: {
        // Helper function to reset chat height to fill window
        setChatLogHeight: function() {
            let newHeight = window.innerHeight - this.$refs["header"].clientHeight - this.$refs["footer"].clientHeight + "px";
            this.$refs["chatlog"].style.height = newHeight;
            this.$refs["messages"].style.maxHeight = newHeight;
        },
        // Count unseen messages outside the viewport
        refreshUnseenMessagesCount: function() {
            var unseenTop = 0;
            var unseenBottom = 0;
            for (var m in this.messages) {
                if (this.$refs["message-" + this.messages[m].mid][0].unseenTop() != -1) {
                    unseenTop++;
                }
                if (this.$refs["message-" + this.messages[m].mid][0].unseenBottom() != -1) {
                    unseenBottom++;
                }
            }
            if (this.showMissedMessagesTop == false && unseenTop > 0) {
                this.showMissedMessagesTop = true;
            }
            if (this.showMissedMessagesBottom == false && unseenBottom > 0) {
                this.showMissedMessagesBottom = true;
            }
            this.missedMessagesTop = unseenTop;
            this.missedMessagesBottom = unseenBottom;
        },
        // Jump to first unseen messages - top
        unreadScrollTop: function(e) {
            for (var m in this.messages) {
                var topPos = this.$refs["message-" + this.messages[m].mid][0].unseenTop();
                if (topPos != -1) {
                    this.$refs.messages.scrollTop = topPos;
                    this.$refs["textinput"].focus();
                    return;
                }
            }
        },
        // Jump to first unseen messages - bottom
        unreadScrollBottom: function(e) {
            for (var m in this.messages) {
                var topPos = this.$refs["message-" + this.messages[m].mid][0].unseenBottom();
                if (topPos != -1) {
                    this.$refs.messages.scrollTop = topPos;
                    this.$refs["textinput"].focus();
                    return;
                }
            }
        },
        // Used by message-row child component to update messages array
        markMessageAsSeen: function(e) {
            this.messages.filter(m => m.mid == e.mid)[0].seen = true;
        },
        // Prevent shift+enter from sending and use this to trigger is-typing notification
        keyDownFunc: function(e) {
            if (e.keyCode == 13 && !e.shiftKey) {
                e.preventDefault();
            } else {
                this.$socketChatServer.emit("is typing");
            }
        },
        // Send a message on enter without shift key
        keyUpFunc: function(e) {
            // Send a message
            if (e.keyCode == 13 && !e.shiftKey) {
                this.message = this.message
                    .replace(/^\s+/, "")
                    .replace(/\s+$/, "")
                    .replace(/\n\s*\n/g, "\n");
                if (this.message !== "") {
                    this.$socketChatServer.emit("send message", this.message);
                    this.message = "";
                }
            }
        },
        textinputClick: function(e) {
            if (this.inputTimer != null) {
                clearInterval(this.inputTimer);
                this.inputTimer = null;
            }
        }
    }
};
</script>
