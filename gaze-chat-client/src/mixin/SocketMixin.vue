<style>
</style>

<template>

    <div>
    </div>

</template>

<script>
import { globalVars } from "@/global-vars.js";
import Vue from "vue";
import io from "socket.io-client";

export default {
    created: function() {
        // Connect to local gaze data source
        Vue.prototype.$socketGazeForwarder = io.connect("https://localhost:4000", {
            query: "clientType=website",
            transports: ["websocket"],
            upgrade: false,
            rejectUnauthorized: false
        });

        // Connect to the chat server
        Vue.prototype.$socketChatServer = io.connect(":3003", {
            query: "clientType=website",
            transports: ["websocket"],
            upgrade: false,
            rejectUnauthorized: false
        });

        this.$socketGazeForwarder.on("connect", () => {
            this.reconnectingToGazeForwarder = 0;
            this.connectedToGazeForwarder = true;
        });
        this.$socketGazeForwarder.on("reconnect", () => {
            this.reconnectingToGazeForwarder = 0;
            this.connectedToGazeForwarder = true;
        });
        this.$socketGazeForwarder.on("reconnecting", () => {
            this.reconnectingToGazeForwarder++;
        });
        this.$socketGazeForwarder.on("error", () => {
            this.connectedToGazeForwarder = false;
        });
        this.$socketGazeForwarder.on("connect_error", () => {
            this.connectedToGazeForwarder = false;
        });
        this.$socketChatServer.on("connect", data => {
            this.connectedToServer = true;
            this.reconnecting = 0;
            this.$log.info("Website connected to Chat Socket.IO-Server! ID: " + this.$socketChatServer.id);
        });
        this.$socketChatServer.on("reconnect", () => {
            this.connectedToServer = true;
            this.$log.info("Socket.IO reconnected!");
        });
        this.$socketChatServer.on("reconnecting", () => {
            this.reconnecting++;
            this.$log.info("Socket.IO reconnecting!");
        });
        this.$socketChatServer.on("error", e => {
            this.connectedToServer = false;
            this.$log.error("Socket.IO error", e);
        });
        this.$socketChatServer.on("connect_error", e => {
            this.connectedToServer = false;
            this.$log.error("Socket.IO connect_error", e);
        });
    },
    data() {
        return {
            connectedToGazeForwarder: true,
            connectedToServer: true,
            reconnectingToServer: 0,
            reconnectingToGazeForwarder: 0
        };
    }
};
</script>
