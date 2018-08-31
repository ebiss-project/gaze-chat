import { globalVars } from "@/global-vars.js";
import HitDetection from "@/gaze/hit-detection.js";

// Simple dispersion-based Fixation Filter for online usage
class FixationFilter {
  constructor() {
    // Parameters
    this.maxGazeDataGap = 55;

    // holder for the temporary fixations gaze data
    this.currentFixationID = 0;
    this.tempFixationGazeData = null;

    // flag for premature fixation event
    this.earlyFixationSent = false;

    // HD Class
    this.hd = new HitDetection();
    this.currentHD = null;
  }

  startNewFixation(raw) {
    this.tempFixationGazeData = [];
    this.tempFixationGazeData.push(raw);
    this.currentHD = null;
  }

  fixationIsValid() {
    var FLength = this.tempFixationGazeData[this.tempFixationGazeData.length - 1].TS - this.tempFixationGazeData[0].TS;
    if (FLength >= globalVars.minFixationDuration) {
      return true;
    }
    return false;
  }

  calcDistBetweenTwoPoints(x1, y1, x2, y2) {
    return Math.round(Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2));
  }

  createFixation(creationTS, early) {
    if (early) {
      this.currentFixationID++;
    }
    var FLength = this.tempFixationGazeData[this.tempFixationGazeData.length - 1].TS - this.tempFixationGazeData[0].TS;
    var gdCount = this.tempFixationGazeData.length;

    // calc fixation coordinates (avg of all gaze data items)
    var x = 0;
    var y = 0;
    var pl = 0;
    var pr = 0;

    // loop raw data
    this.tempFixationGazeData.forEach(function(rdg) {
      // sum coordinates
      x += rdg.X;
      y += rdg.Y;

      // sum pupil diameter
      pl += rdg.PL;
      pr += rdg.PR;
    });

    var f = {};
    f.earlyFlag = early;
    f.ID = this.currentFixationID;
    f.TS = this.tempFixationGazeData[0].TS;
    f.X = Math.round(x / gdCount);
    f.Y = Math.round(y / gdCount);
    f.FLength = FLength;
    f.PL = pl / gdCount;
    f.PR = pr / gdCount;
    f.delayInMS = creationTS - this.tempFixationGazeData[this.tempFixationGazeData.length - 1].TS;

    // Perform HD if fixation begin
    if (early) {
      this.currentHD = this.hd.hitdetection(f.X, f.Y);
    }

    f.HD = this.currentHD;
    return f;
  }

  tryAddGazeData(raw) {
    if (this.tempFixationGazeData == null) {
      // Start new Fixation
      this.startNewFixation(raw);
      return null;
    } else {
      // Try adding
      if (
        this.calcDistBetweenTwoPoints(raw.X, raw.Y, this.tempFixationGazeData[0].X, this.tempFixationGazeData[0].Y) <= globalVars.maxFixationRadius &&
        raw.TS - this.tempFixationGazeData[this.tempFixationGazeData.length - 1].TS < this.maxGazeDataGap
      ) {
        // Good to go
        this.tempFixationGazeData.push(raw);

        // check for early fixation...
        if (!this.earlyFixationSent && this.fixationIsValid()) {
          var f = this.createFixation(raw.TS, true);

          // draw Fixation Begin
          if (globalVars.showFixationBegin) {
            this.drawFixation(f, "fixationBegin");
          }

          this.earlyFixationSent = true;
          return f;
        }
        return null;
      } else {
        // Not part of the current potential fixation...
        var f = null;
        // Create a fixation if it is valid
        if (this.fixationIsValid()) {
          f = this.createFixation(raw.TS, false);
        }

        // draw Fixation
        if (f != null && globalVars.showFixations) {
          this.drawFixation(f, "fixation");
        }

        // Reset early fixation flag
        this.earlyFixationSent = false;

        // Start a new fixation with this gaze data no matter what
        this.startNewFixation(raw);

        return f;
      }
    }
  }

  drawFixation(f, className) {
    var fb = document.createElement("div");
    fb.classList.add(className);
    fb.classList.add("overlay");
    fb.classList.add("overlay-f-" + f.ID);
    fb.style.left = f.X - globalVars.maxFixationRadius + "px";
    fb.style.top = f.Y - globalVars.maxFixationRadius + "px";
    fb.style.width = globalVars.maxFixationRadius * 2 + "px";
    fb.style.height = globalVars.maxFixationRadius * 2 + "px";
    fb.innerHTML = "<span>" + f.ID + "</span><br><span>" + f.FLength + "ms</span>";
    document.body.appendChild(fb);

    // Also draw related raw data
    for (var i = 0; i < this.tempFixationGazeData.length; i++) {
      var dot = document.createElement("div");
      dot.classList.add("raw");
      dot.classList.add("overlay");
      dot.classList.add("overlay-f-" + f.ID);
      dot.style.left = this.tempFixationGazeData[i].X - 1 + "px";
      dot.style.top = this.tempFixationGazeData[i].Y - 1 + "px";
      document.body.appendChild(dot);
    }

    setTimeout(() => {
      var elements = document.getElementsByClassName("overlay-f-" + f.ID);
      while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
      }
    }, globalVars.showFixationDisplayTimeout);
  }
}
export default FixationFilter;
