// Globally directive to mark elements for HitDetection
import Vue from "vue";
Vue.directive("gazeEnabled", function(el, binding) {
  el.classList.add("gaze-enabled");
  if (binding.value && binding.value.aoiId != undefined) el.dataset.aoiId = binding.value.aoiId;
  if (binding.value && binding.value.aoiType != undefined) el.dataset.aoiType = binding.value.aoiType;
  if (binding.value && binding.value.aoiName != undefined) el.dataset.aoiName = binding.value.aoiName;
  if (binding.value && binding.value.aoiData != undefined) el.dataset.aoiData = JSON.stringify(binding.value.aoiData);
  if (binding.arg) {
    el.dataset.eventName = binding.arg;
  }
});

// Event Bus for broadcasting gaze related data
import { EventBus } from "@/event-bus.js";
import { globalVars } from "@/global-vars.js";

// HitDetection class
class HitDetection {
  constructor() {
    this.hdID = 0;
    this.border = 0;
    this.menuHeight = 0;
    this.absX = 0;
    this.absY = 0;

    this.calcWindowBasedOffsets();
  }

  calcWindowBasedOffsets() {
    // this is the border width of the OS window.
    this.border = (window.outerWidth - window.innerWidth) / 2;
    // Assuming the window border is homogeneous and there is nothing in
    // the bottom of the window (firebug or something like that)
    this.menuHeight = window.outerHeight - window.innerHeight - this.border * 2;
    this.absX = window.screenX + this.border; // is aware of multiple monitors!
    this.absY = window.screenY + this.border + this.menuHeight;
  }

  calcDistBetweenTwoPoints(x1, y1, x2, y2) {
    return Math.round(Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2));
  }

  hitdetection(inx, iny) {
    this.calcWindowBasedOffsets();
    this.hdID++;

    // always delete old HD dots
    if (globalVars.showHitDetection) {
      var elements = document.getElementsByClassName("dot");
      while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
      }
    }

    var activeList = [];
    var passiveList = [];

    var p1 = {
      x: inx - globalVars.HitDetectionRectWith / 2,
      y: iny - globalVars.HitDetectionRectHeight / 2
    };
    var p2 = {
      x: inx + globalVars.HitDetectionRectWith / 2,
      y: iny + globalVars.HitDetectionRectHeight / 2
    };
    for (var x = p1.x; x <= p2.x; x += globalVars.HitDetectionIntv) {
      if (x < 0 || x > document.body.clientWidth) continue;
      for (var y = p1.y; y <= p2.y; y += globalVars.HitDetectionIntv) {
        if (y < 0 || y > document.body.clientHeight) continue;

        var topElement = document.elementFromPoint(x, y);
        if (topElement == null) return;
        do {
          if (topElement.classList.contains("gaze-enabled")) {
            var dist = this.calcDistBetweenTwoPoints(inx, iny, x, y);
            if (topElement.dataset && topElement.dataset.eventName == "active") {
              var obj = activeList.find(o => o.el === topElement.dataset);
              if (obj) {
                obj.counter++;
                if (obj.distance > dist) {
                  obj.distance = dist;
                }
              } else {
                activeList.push({
                  counter: 1,
                  distance: dist,
                  el: topElement.dataset
                });
              }
            } else {
              var obj = passiveList.find(o => o.el === topElement.dataset);
              if (obj) {
                obj.counter++;
                if (obj.distance > dist) {
                  obj.distance = dist;
                }
              } else {
                passiveList.push({
                  counter: 1,
                  distance: dist,
                  el: topElement.dataset
                });
              }
            }
          }
          topElement = topElement.parentNode;
        } while (topElement.parentNode);

        // Draw HitDetection Dots
        if (globalVars.showHitDetection) {
          var dot = document.createElement("div");
          dot.classList.add("dot");
          dot.classList.add("overlay");
          dot.style.left = x + "px";
          dot.style.top = y + "px";
          document.body.appendChild(dot);
        }
      }
    }

    // Active Elements will be notified via EventBus
    if (activeList.length > 0) {
      activeList.sort(function(a, b) {
        return a.counter < b.counter ? 1 : b.counter < a.counter ? -1 : 0;
      });
      passiveList.sort(function(a, b) {
        return a.distance > b.distance ? 1 : b.distance > a.distance ? -1 : 0;
      });

      if (activeList[0].el.aoiName) {
        EventBus.$emit(activeList[0].el.aoiName, {
          receiverEl: activeList[0].el,
          passiveList: passiveList.filter(o => o.el.aoiId == activeList[0].el.aoiId)
        });
      }
    }

    // Return Hitdetection
    return {
      hdID: this.hdID,
      activeList,
      passiveList
    };
  }
}
export default HitDetection;
