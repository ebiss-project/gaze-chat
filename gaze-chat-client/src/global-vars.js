class GlobalVars {
  constructor() {
    // Overlay Settings
    this.showHitDetection = false;
    this.showFixations = false;
    this.showFixationBegin = false;
    this.showFixationDisplayTimeout = 1250;
    this.showGazeCursorRaw = false;
    this.showGazeCursorFixationBegin = false;

    // GazeFeedBack
    this.gazeFeedbackSize = 100;
    this.gazeFeedbackDiffThreshold = 30;
    this.gazeFeedbackHideTimeout = 1000;
    this.gazeFeedbackErrorTimeout = 750;

    // Gaze Manipulation
    this.gazeOffsetX = 0;
    this.gazeOffsetY = 0;

    // FixationFilter
    this.minFixationDuration = 60;
    this.maxFixationRadius = 50;

    // HitDetection
    this.HitDetectionRectWith = 104;
    this.HitDetectionRectHeight = 80;
    this.HitDetectionIntv = 8;

    // Fake User Scenario Helper PopUp
    this.pauseBetweenCharacters = 100; //in ms

    // Gaze Chat Settings
    this.stroopCharacterThreshold = 14;
    this.readingAnimationFixationCountThreshold = 4; // If x fixations are received, start reading animation
    this.readingAnimationFixationCountThresholdStroop = 2; // On short messages: If x fixations are received, start reading animation

    // Analysis & Database Settings
    this.readingIntervalFixationCountThreshold = 2; // If x fixations are part of a reading interval, keep it, otherwise discard!

    // helper variables
    this.gcRawX = 0;
    this.gcRawY = 0;
    this.gcFBeginX = 0;
    this.gcFBeginY = 0;
  }
}

export let globalVars = new GlobalVars();
