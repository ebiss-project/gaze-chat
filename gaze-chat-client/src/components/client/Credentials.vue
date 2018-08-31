<style>
.avatar {
    width: 40px;
    height: 40px;
}

.color-list {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

.color-list + * {
    clear: both;
}

.color-list > li {
    float: left;
    padding: 5px;
    position: relative;
}

.color-list > li > a {
    display: block;
    height: 22px;
    width: 18px;
    background: #ccc;
}

.color-list > li > a.noColor:after,
.color-list > li > a.noColor.selected:after {
    content: "";
    background: red;
    -webkit-transform: rotate(-51deg);
    transform: rotate(-51deg);
    display: inline-block;
    position: absolute;
    bottom: 15px;
    top: 15px;
    left: 1px;
    width: 26px;
    height: 2px;
}

.color-list > li > a:hover {
    border: 2px solid #2e2e2e;
}

.color-list > li > a.selected {
    border: 2px solid #2e2e2e;
}

.color-list > li > a.noColor.selected {
    border: 2px solid #2e2e2e;
}
</style>

<template>

    <div class="container">
        <div class="row" style="position:absolute;width:100%;top:100px;z-index:1000000;">
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
        <div class="row">
            <div class="col-lg-12">
                <h1>Join Chat</h1>

                <div class="form-group row">
                    <label class="col-sm-2 col-form-label">Username</label>
                    <div class="col-sm-4">
                        <input type="text" class="form-control" placeholder="Username" v-model="username" required>
                    </div>
                    <label class="col-sm-6 col-form-label">
                        <span class="badge badge-info" :style="{background: selectedColorHex}">{{ username }}</span>
                    </label>
                </div>

                <div class="form-group row">
                    <label class="col-sm-2 col-form-label">Color</label>
                    <div class="col-sm-4">
                        <div id="color-picker">
                            <color-picker :color-options="colors" input-id="color" v-model="selectedColorHex"></color-picker>
                            <div style="clear: both;"></div>
                        </div>
                    </div>
                </div>

                <div class="form-group row">
                    <label class="col-sm-2 col-form-label">Picture</label>
                    <div class="col-sm-10">
                        <div class="form-check form-check-inline" v-for="pic in pictures" :key="pic">
                            <label class="form-check-label">
                                <input class="form-check-input" type="radio" v-model="picture" name="picture" v-bind:value="pic">
                                <img v-bind:src="'./static/avatars/'+pic+'.png'" class="avatar">
                            </label>
                        </div>
                        <br>
                        <template v-if="webcamError">
                            <div class="alert alert-danger" role="alert">Couldn't connect to webcam or the access was blocked.</div>
                        </template>
                        <template v-else>
                            <div class="form-check form-check-inline">
                                <label class="form-check-label">
                                    <input class="form-check-input" type="radio" v-model="picture" name="picture" value="webcam">
                                    <img :src="webcam" class="avatar">
                                </label>
                            </div>
                            <div class="col-sm-10">Click on the video to take a picture.
                                <div style="width:360px;height:360px;overflow:hidden;cursor:pointer;">
                                    <video ref="webcam" autoplay @click="takeSnapshot" style="width:640px;height: auto !important;position:relative;margin-top:-60px;margin-left:-140px;"></video>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="form-group row ">
                    <label class="col-sm-2 col-form-label ">Preview:</label>
                    <div class="col-sm-2 " style="text-align:center;padding-top:10px; ">
                        <img :src="webcam != './static/avatars/webcam.png' ? webcam : './static/avatars/unknown.png'" class="avatar "><br>
                        <span class="badge badge-info " :style="{background: selectedColorHex} ">{{ username || '(leer)' }}</span>
                    </div>
                </div>

                <div class="form-group row">
                    <label class="col-sm-2 col-form-label"></label>
                    <div class="col-sm-10">
                        <button type="submit" class="btn btn-primary" @click="startChat">Join!</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
var ColorPicker = {
    template:
        '<div><ul class="color-list"><li v-if="emptyOption"><a class="noColor" v-if="emptyOption !== \'true\'" href="" @click.prevent="setColor();" :title="emptyOption === \'true\' ? \'\' : emptyOption" :class="{selected: !selectedColor && !noSelection}"></a></li><li v-for="color in colors"><a href="" :style="{background: color.hex}" :title="color.name" @click.prevent="setColor(color.hex, color.name)" :class="{selected: selectedColor === color.hex}"></a></li></ul><input type="hidden" :name="inputId" :id="inputId" v-model="selectedColor"></div>',
    props: ["color-options", "empty-option", "input-id"],
    data: function() {
        return {
            selectedColor: "",
            selectedColorName: "",
            colors: this.colorOptions,
            noSelection: false
        };
    },
    watch: {
        colorOptions: function(val) {
            this.colorOptions = val;
            this.colors = val;
            this.setColor(this.colors[0].hex, this.colors[0].name);
        }
    },
    methods: {
        setColor: function(color, colorName) {
            this.selectedColor = color;
            this.selectedColorName = colorName;
            this.noSelection = false;
            this.$emit("input", this.selectedColor);
        }
    }
};

import SocketMixin from "@/mixin/SocketMixin";

export default {
    mixins: [SocketMixin],
    mounted: function() {
        var video = document.querySelector("video");
        if (navigator.mediaDevices) {
            // access the web cam
            navigator.mediaDevices
                .getUserMedia({ video: true })
                // permission granted:
                .then(stream => {
                    video.srcObject = stream;
                    console.log(stream);
                })
                // permission denied:
                .catch(error => {
                    console.log("Webcam error", error);
                    this.webcamError = true;
                });
        }
    },
    name: "credentials",
    components: {
        "color-picker": ColorPicker
    },
    created: function() {
        document.title = "Chat | Credentials";
        this.$socketChatServer.emit("fetch color palette");

        this.$socketChatServer.on("fetch color palette", data => {
            this.colors = data.colors;
            console.log("colors", data);
        });
    },
    data() {
        return {
            UID: 1,
            username: "Proband",
            role: "participant",
            colors: [],
            selectedColorHex: "",
            picture: "unknown",
            pictures: ["unknown"],
            chat: "gc",
            curtain: false,
            webcam: "./static/avatars/webcam.png",
            webcamError: false
        };
    },
    methods: {
        ready: function() {
            return !(this.photo != "./static/avatars/unknown.png" && this.username != "");
        },
        takeSnapshot: function() {
            var video = document.querySelector("video");
            var context;
            var width = video.offsetWidth,
                height = video.offsetHeight;

            var canvas = document.createElement("canvas");
            canvas.width = 90;
            canvas.height = 90;

            context = canvas.getContext("2d");
            context.drawImage(video, 140, 60, 360, 360, 0, 0, 90, 90);

            this.picture = "webcam";
            this.webcam = canvas.toDataURL("image/png");
        },
        startChat: function() {
            if (this.picture == "webcam" && this.webcam.length > 50) {
                // Upload photo:
                this.$socketChatServer.emit(
                    "upload photo",
                    {
                        photo: this.webcam
                    },
                    filename => {
                        console.log("Filename is: " + filename);
                        this.$router.push({
                            name: "chat",
                            params: {
                                username: this.username,
                                picture: filename,
                                color: this.selectedColorHex
                            }
                        });
                    }
                );
            } else {
                this.$router.push({
                    name: "chat",
                    params: {
                        username: this.username,
                        picture: this.picture,
                        color: this.selectedColorHex
                    }
                });
            }
        }
    }
};
</script>
