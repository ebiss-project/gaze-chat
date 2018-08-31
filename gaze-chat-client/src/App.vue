<style>
html,
body {
    background-color: rgb(238, 238, 238) !important;
}

::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track-piece {
    background-color: #eee;
}

::-webkit-scrollbar-thumb {
    background-color: #ccc;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #909090;
}

div.dot {
    background-color: red;
    width: 1px;
    height: 1px;
    line-height: 1px;
    position: absolute;
    pointer-events: none;
    z-index: 10000;
}

div.raw {
    background-color: green;
    width: 3px;
    height: 3px;
    line-height: 1px;
    position: absolute;
    pointer-events: none;
    z-index: 1000;
}

div.gcRaw {
    border-radius: 50%;
    border: 3px solid rgba(0, 150, 0, 0.5);
    position: absolute;
    pointer-events: none;
    text-align: center;
    z-index: 1000;
}

div.gcFBegin {
    border-radius: 50%;
    border: 3px solid rgba(248, 120, 0, 0.5);
    position: absolute;
    pointer-events: none;
    text-align: center;
    z-index: 1000;
}

div.fixation {
    border-radius: 50%;
    border: 3px solid rgba(0, 0, 255, 0.5);
    position: absolute;
    pointer-events: none;
    text-align: center;
    z-index: 1000;
}

div.fixationBegin {
    border-radius: 50%;
    border: 3px solid rgba(255, 0, 0, 0.5);
    position: absolute;
    pointer-events: none;
    text-align: center;
    line-height: 11px;
    z-index: 1000;
}

div.fixation span,
div.fixationBegin span {
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    font-size: 12px;
    font-family: monospace;
}
</style>

<template>

    <div id="app">
        <router-view></router-view>
    </div>

</template>

<script>
import { globalVars } from "@/global-vars.js";

require("../node_modules/font-awesome/css/font-awesome.min.css");
require("../node_modules/bootstrap/dist/css/bootstrap.min.css");
require("../node_modules/animate.css/animate.min.css");
export default {};
</script>
