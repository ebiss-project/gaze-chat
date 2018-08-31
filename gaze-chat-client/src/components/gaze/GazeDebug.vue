<style scoped>
#gazedebug {
    position: absolute;
    top: 20px;
    left: 10px;
    box-shadow: -1px 10px 37px -10px rgba(0, 0, 0, 0.75);
    border: 1px solid #aaa;
    background-color: #eee;
    padding: 10px;
    border-radius: 10px;
    z-index: 1000000;
    width: 370px;
}
#evaluation {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100vh;
    width: 100vw;
    background-color: #eee;
    z-index: 500;
}
.evalpt {
    border-radius: 50%;
    border: 3px solid rgba(255, 115, 0, 0.5);
    background-color: rgba(255, 115, 0, 0.2);
    position: absolute;
    pointer-events: none;
    text-align: center;
    width: 40px;
    height: 40px;
    margin-left: -20px;
    margin-top: -20px;
}
.hide {
    display: none;
}
</style>

<template>

    <div>
        <div id="evaluation">
            <div class="evalpt" style="left:10vw;top:10vh;"></div>
            <div class="evalpt" style="left:50vw;top:10vh;"></div>
            <div class="evalpt" style="left:90vw;top:10vh;"></div>
            <div class="evalpt" style="left:10vw;top:50vh;"></div>
            <div class="evalpt" style="left:50vw;top:50vh;"></div>
            <div class="evalpt" style="left:90vw;top:50vh;"></div>
            <div class="evalpt" style="left:10vw;top:90vh;"></div>
            <div class="evalpt" style="left:50vw;top:90vh;"></div>
            <div class="evalpt" style="left:90vw;top:90vh;"></div>

            <div class="evalpt" style="left:30vw;top:30vh;"></div>
            <div class="evalpt" style="left:70vw;top:30vh;"></div>
            <div class="evalpt" style="left:30vw;top:70vh;"></div>
            <div class="evalpt" style="left:70vw;top:70vh;"></div>
        </div>

        <div id="gazedebug">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <h6>Blickdaten verschieben</h6>
                        <div class="form-group row">
                            <label class="col-sm-2 col-form-label">Horizontal</label>
                            <div class="col-sm-4" style="padding-top:35px;">
                                <vue-slider ref="gazeOffsetXSlider" v-model="gazeOffsetX" :min="-100" :max="100" :interval="1" formatter="{value}px"></vue-slider>
                            </div>
                            <label class="col-sm-2 col-form-label">Vertikal</label>
                            <div class="col-sm-4" style="padding-top:35px;">
                                <vue-slider ref="gazeOffsetYSlider" v-model="gazeOffsetY" :min="-100" :max="100" :interval="1" formatter="{value}px"></vue-slider>
                            </div>
                        </div>

                        <h6>Fixationsfilter</h6>
                        <div class=" form-group row">
                            <label class="col-sm-2 col-form-label">max. Radius</label>
                            <div class="col-sm-4" style="padding-top:35px;">
                                <vue-slider ref="maxFixationRadiusSlider" v-model="maxFixationRadius" :min="10" :max="200" :interval="5" formatter="{value}px"></vue-slider>
                            </div>
                            <label class="col-sm-2 col-form-label">min. Dauer</label>
                            <div class="col-sm-4" style="padding-top:35px;">
                                <vue-slider ref="minFixationDurationSlider" v-model="minFixationDuration" :min="50" :max="300" :interval="5" formatter="{value}ms"></vue-slider>
                            </div>
                        </div>

                        <h6>Lese-Animation starten ab:</h6>
                        <div class="form-group row">
                            <label class="col-sm-3 col-form-label">Kurze Nachricht</label>
                            <div class="col-sm-3" style="padding-top:35px;">
                                <vue-slider ref="readingAnimationFixationCountThresholdStroopSlider" v-model="readingAnimationFixationCountThresholdStroop" :min="1" :max="10" :interval="1" formatter="{value} Fixationen"></vue-slider>
                            </div>
                            <label class="col-sm-3 col-form-label">Lange Nachricht</label>
                            <div class="col-sm-3" style="padding-top:35px;">
                                <vue-slider ref="readingAnimationFixationCountThresholdSlider" v-model="readingAnimationFixationCountThreshold" :min="1" :max="10" :interval="1" formatter="{value} Fixationen"></vue-slider>
                            </div>
                        </div>

                        <h6>Hit-Detection</h6>
                        <div class="form-group row">
                            <div class="col-sm-3" style="padding-top:35px;">
                                <vue-slider ref="HitDetectionRectWidthSlider" v-model="HitDetectionRectWith" :min="16" :max="144" :interval="8" formatter="{value}px"></vue-slider>
                            </div>
                            <label class="col-sm-1 col-form-label" style="padding-top:30px;">x</label>
                            <div class="col-sm-3" style="padding-top:35px;">
                                <vue-slider ref="HitDetectionRectHeightSlider" v-model="HitDetectionRectHeight" :min="16" :max="112" :interval="8" formatter="{value}px"></vue-slider>
                            </div>
                            <label class="col-sm-1 col-form-label" style="padding-top:30px;">I:</label>
                            <div class="col-sm-3" style="padding-top:23px;">
                                <input type="text" class="form-control" v-model="HitDetectionIntv" required disabled="true">
                            </div>
                        </div>

                        <h6>Gaze Feedback</h6>
                        <div class="form-group row">
                            <label class="col-sm-2 col-form-label" style="padding-top:30px;">Größe</label>
                            <div class="col-sm-4" style="padding-top:35px;">
                                <vue-slider ref="gazeFeedbackSizeSlider" v-model="gazeFeedbackSize" :min="10" :max="300" :interval="10" formatter="{value}px"></vue-slider>
                            </div>
                            <label class="col-sm-2 col-form-label" style="padding-top:30px;">Puffer</label>
                            <div class="col-sm-4" style="padding-top:35px;">
                                <vue-slider ref="gazeFeedbackDiffThresholdSlider" v-model="gazeFeedbackDiffThreshold" :min="0" :max="200" :interval="5" formatter="{value}px"></vue-slider>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-sm-2 col-form-label" style="padding-top:30px;">Hide</label>
                            <div class="col-sm-4" style="padding-top:35px;">
                                <vue-slider ref="gazeFeedbackHideTimeoutSlider" v-model="gazeFeedbackHideTimeout" :min="100" :max="5000" :interval="100" formatter="{value}ms"></vue-slider>
                            </div>
                            <label class="col-sm-2 col-form-label" style="padding-top:30px;">ShowRed</label>
                            <div class="col-sm-4" style="padding-top:35px;">
                                <vue-slider ref="gazeFeedbackErrorTimeoutSlider" v-model="gazeFeedbackErrorTimeout" :min="500" :max="10000" :interval="500" formatter="{value}ms"></vue-slider>
                            </div>
                        </div>

                        <h6>Overlay</h6>
                        <div class="form-group row">
                            <div class="col-sm-12">
                                <label class="form-check-label">
                                    <switcher v-model="showGazeCursorRaw" ref="gazeCursorRawSwitcher">Blickpunkt (Rohdaten)</switcher>
                                </label>
                                <label class="form-check-label">
                                    <switcher v-model="showGazeCursorFixationBegin">Blickpunkt (Fixationsbeginn)</switcher>
                                </label>
                                <label class="form-check-label">
                                    <switcher v-model="showFixationBegin">Fixationsbeginn (rot)</switcher>
                                </label>
                                <label class="form-check-label">
                                    <switcher v-model="showFixations">Fixationsende (blau)</switcher>
                                </label>
                                <label class="form-check-label">
                                    <switcher v-model="showHitDetection">Hit-Detection</switcher>
                                </label>
                            </div>
                        </div>

                        <div class="form-group row">
                            <label class="col-sm-6 col-form-label" style="padding-top:15px;">Ausblenden nach:</label>
                            <div class="col-sm-6" style="padding-top:20px;">
                                <vue-slider ref="showFixationDisplayTimeoutSlider" v-model="showFixationDisplayTimeout" :min="250" :max="5000" :interval="250" formatter="{value}ms"></vue-slider>
                            </div>
                        </div>

                        <div class="form-group row">
                            <div class="col-sm-6" style="">
                                <button class="btn-sm btn-secondary" @click="hideWindow">Hide Window (F9)</button>
                            </div>
                            <div class="col-sm-6" style="text-align:right;">
                                <button class="btn-sm btn-primary" @click="clearOverlay">Clear Overlay (F7)</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import { globalVars } from "@/global-vars.js";
import vueSlider from "vue-slider-component";
import Switcher from "@/components/gui/Switcher";

export default {
    components: {
        vueSlider,
        Switcher
    },
    mounted: function() {
        // init hidden
        document.getElementById("gazedebug").classList.add("hide");
        document.getElementById("evaluation").classList.add("hide");

        document.addEventListener("keyup", e => {
            if (e.key == "F9") {
                document.getElementById("gazedebug").classList.toggle("hide");
                this.$refs.maxFixationRadiusSlider.refresh();
                this.$refs.minFixationDurationSlider.refresh();
                this.$refs.readingAnimationFixationCountThresholdStroopSlider.refresh();
                this.$refs.readingAnimationFixationCountThresholdSlider.refresh();
                this.$refs.HitDetectionRectHeightSlider.refresh();
                this.$refs.HitDetectionRectWidthSlider.refresh();
                this.$refs.showFixationDisplayTimeoutSlider.refresh();
                this.$refs.gazeOffsetXSlider.refresh();
                this.$refs.gazeOffsetYSlider.refresh();
                this.$refs.gazeFeedbackSizeSlider.refresh();
                this.$refs.gazeFeedbackDiffThresholdSlider.refresh();
                this.$refs.gazeFeedbackHideTimeoutSlider.refresh();
                this.$refs.gazeFeedbackErrorTimeoutSlider.refresh();
            }
        });
        document.addEventListener("keyup", e => {
            if (e.key == "F7") {
                this.clearOverlay();
            }
        });
        document.addEventListener("keyup", e => {
            if (e.key == "F4") {
                if (document.getElementById("evaluation").classList.contains("hide")) {
                    this.$refs.gazeCursorRawSwitcher.check();
                } else {
                    this.$refs.gazeCursorRawSwitcher.uncheck();
                }
                document.getElementById("evaluation").classList.toggle("hide");
            }
        });
    },
    name: "GazeDebug",
    watch: {
        gazeFeedbackHideTimeout: function(newVal) {
            this.gazeFeedbackHideTimeout = newVal;
            globalVars.gazeFeedbackHideTimeout = this.gazeFeedbackHideTimeout;
        },
        gazeFeedbackErrorTimeout: function(newVal) {
            this.gazeFeedbackErrorTimeout = newVal;
            globalVars.gazeFeedbackErrorTimeout = this.gazeFeedbackErrorTimeout;
        },
        gazeFeedbackSize: function(newVal) {
            this.gazeFeedbackSize = newVal;
            globalVars.gazeFeedbackSize = this.gazeFeedbackSize;
        },
        gazeFeedbackDiffThreshold: function(newVal) {
            this.gazeFeedbackDiffThreshold = newVal;
            globalVars.gazeFeedbackDiffThreshold = this.gazeFeedbackDiffThreshold;
        },
        gazeOffsetX: function(newVal) {
            this.gazeOffsetX = newVal;
            globalVars.gazeOffsetX = this.gazeOffsetX;
        },
        gazeOffsetY: function(newVal) {
            this.gazeOffsetY = newVal;
            globalVars.gazeOffsetY = this.gazeOffsetY;
        },
        showHitDetection: function(newVal) {
            this.showHitDetection = newVal;
            globalVars.showHitDetection = this.showHitDetection;
            if (newVal == false) {
                var elements = document.getElementsByClassName("dot");
                while (elements.length > 0) {
                    elements[0].parentNode.removeChild(elements[0]);
                }
            }
        },
        showFixations: function(newVal) {
            this.showFixations = newVal;
            globalVars.showFixations = this.showFixations;
        },
        showFixationBegin: function(newVal) {
            this.showFixationBegin = newVal;
            globalVars.showFixationBegin = this.showFixationBegin;
        },
        minFixationDuration: function(newVal) {
            this.minFixationDuration = newVal;
            globalVars.minFixationDuration = this.minFixationDuration;
        },
        maxFixationRadius: function(newVal) {
            this.maxFixationRadius = newVal;
            globalVars.maxFixationRadius = this.maxFixationRadius;
        },
        showFixationDisplayTimeout: function(newVal) {
            this.showFixationDisplayTimeout = newVal;
            globalVars.showFixationDisplayTimeout = this.showFixationDisplayTimeout;
        },
        HitDetectionRectWith: function(newVal) {
            this.HitDetectionRectWith = newVal;
            globalVars.HitDetectionRectWith = this.HitDetectionRectWith;
        },
        HitDetectionRectHeight: function(newVal) {
            this.HitDetectionRectHeight = newVal;
            globalVars.HitDetectionRectHeight = this.HitDetectionRectHeight;
        },
        HitDetectionIntv: function(newVal) {
            this.HitDetectionIntv = newVal;
            globalVars.HitDetectionIntv = this.HitDetectionIntv;
        },
        readingAnimationFixationCountThreshold: function(newVal) {
            this.readingAnimationFixationCountThreshold = newVal;
            globalVars.readingAnimationFixationCountThreshold = this.readingAnimationFixationCountThreshold;
        },
        readingAnimationFixationCountThresholdStroop: function(newVal) {
            this.readingAnimationFixationCountThresholdStroop = newVal;
            globalVars.readingAnimationFixationCountThresholdStroop = this.readingAnimationFixationCountThresholdStroop;
        },
        showGazeCursorFixationBegin: function(newVal) {
            this.showGazeCursorFixationBegin = newVal;
            globalVars.showGazeCursorFixationBegin = this.showGazeCursorFixationBegin;
            if (newVal) {
                var gcFBegin = document.createElement("div");
                gcFBegin.classList.add("gcFBegin");
                gcFBegin.classList.add("overlay");
                document.body.appendChild(gcFBegin);

                var xp = 0,
                    yp = 0;
                this.loopFBegin = setInterval(() => {
                    // change denominator to alter damping: higher is slower
                    xp += (globalVars.gcFBeginX - xp) / 4;
                    yp += (globalVars.gcFBeginY - yp) / 4;
                    gcFBegin.style.left = xp - globalVars.maxFixationRadius + "px";
                    gcFBegin.style.top = yp - globalVars.maxFixationRadius + "px";
                    gcFBegin.style.width = globalVars.maxFixationRadius * 2 + "px";
                    gcFBegin.style.height = globalVars.maxFixationRadius * 2 + "px";
                }, 16);
            } else {
                clearInterval(this.loopFBegin);
                var elements = document.getElementsByClassName("gcFBegin");
                while (elements.length > 0) {
                    elements[0].parentNode.removeChild(elements[0]);
                }
            }
        },
        showGazeCursorRaw: function(newVal) {
            this.showGazeCursorRaw = newVal;
            globalVars.showGazeCursorRaw = this.showGazeCursorRaw;
            if (newVal) {
                var gcRaw = document.createElement("div");
                gcRaw.classList.add("gcRaw");
                gcRaw.classList.add("overlay");
                document.body.appendChild(gcRaw);

                var xp = 0,
                    yp = 0;
                this.loopRaw = setInterval(() => {
                    // change denominator to alter damping: higher is slower
                    xp += (globalVars.gcRawX - xp) / 4;
                    yp += (globalVars.gcRawY - yp) / 4;
                    gcRaw.style.left = xp - globalVars.maxFixationRadius + "px";
                    gcRaw.style.top = yp - globalVars.maxFixationRadius + "px";
                    gcRaw.style.width = globalVars.maxFixationRadius * 2 + "px";
                    gcRaw.style.height = globalVars.maxFixationRadius * 2 + "px";
                }, 16);
            } else {
                clearInterval(this.loopRaw);
                var elements = document.getElementsByClassName("gcRaw");
                while (elements.length > 0) {
                    elements[0].parentNode.removeChild(elements[0]);
                }
            }
        }
    },
    data() {
        return {
            loopRaw: null,
            loopFBegin: null,
            gazeOffsetX: globalVars.gazeOffsetX,
            gazeOffsetY: globalVars.gazeOffsetY,
            showFixations: globalVars.showFixations,
            showFixationBegin: globalVars.showFixationBegin,
            showHitDetection: globalVars.showHitDetection,
            minFixationDuration: globalVars.minFixationDuration,
            showFixationDisplayTimeout: globalVars.showFixationDisplayTimeout,
            maxFixationRadius: globalVars.maxFixationRadius,
            HitDetectionRectWith: globalVars.HitDetectionRectWith,
            HitDetectionRectHeight: globalVars.HitDetectionRectHeight,
            HitDetectionIntv: globalVars.HitDetectionIntv,
            readingAnimationFixationCountThreshold: globalVars.readingAnimationFixationCountThreshold,
            readingAnimationFixationCountThresholdStroop: globalVars.readingAnimationFixationCountThresholdStroop,
            showGazeCursorFixationBegin: globalVars.showGazeCursorFixationBegin,
            showGazeCursorRaw: globalVars.showGazeCursorRaw,
            gazeFeedbackDiffThreshold: globalVars.gazeFeedbackDiffThreshold,
            gazeFeedbackSize: globalVars.gazeFeedbackSize,
            gazeFeedbackHideTimeout: globalVars.gazeFeedbackHideTimeout,
            gazeFeedbackErrorTimeout: globalVars.gazeFeedbackErrorTimeout
        };
    },
    methods: {
        clearOverlay: function() {
            var elements = document.getElementsByClassName("overlay");
            while (elements.length > 0) {
                elements[0].parentNode.removeChild(elements[0]);
            }
        },
        hideWindow: function() {
            document.getElementById("gazedebug").classList.toggle("hide");
        }
    }
};
</script>
