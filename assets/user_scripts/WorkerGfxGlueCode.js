"use strict";
/*
 Copyright (C) 2012-2019 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var gfxBuffers = null;
var gfxCounters = null;
function iodineGBAWorkerGfxShim() {
    this.gfx = null;
    gfxBuffers = [getSharedUint8Array(160 * 240 * 3),
    getSharedUint8Array(160 * 240 * 3)];
    gfxCounters = getSharedInt32Array(3);
    this.Iodine = new GameBoyAdvanceEmulator();
}
iodineGBAWorkerGfxShim.prototype.play = function () {
    this.Iodine.play();
}
iodineGBAWorkerGfxShim.prototype.pause = function () {
    this.Iodine.pause();
}
iodineGBAWorkerGfxShim.prototype.restart = function () {
    this.Iodine.restart();
}
iodineGBAWorkerGfxShim.prototype.setIntervalRate = function (rate) {
    rate = +rate;
    this.Iodine.setIntervalRate(+rate);
}
iodineGBAWorkerGfxShim.prototype.timerCallback = function (timestamp) {
    timestamp = timestamp >>> 0;
    this.Iodine.timerCallback(timestamp);
}
iodineGBAWorkerGfxShim.prototype.attachGraphicsFrameHandler = function (gfx) {
    this.gfx = gfx;
    var parentObj = this;
    this.gfx.attachGfxCallback(function () {
        parentObj.graphicsHeartBeat();
    });
    this.Iodine.attachGraphicsFrameHandler(gfx);
}
iodineGBAWorkerGfxShim.prototype.attachAudioHandler = function (audio) {
    this.Iodine.attachAudioHandler(audio);
}
iodineGBAWorkerGfxShim.prototype.enableAudio = function () {
    this.Iodine.enableAudio();
}
iodineGBAWorkerGfxShim.prototype.disableAudio = function () {
    this.Iodine.disableAudio();
}
iodineGBAWorkerGfxShim.prototype.toggleSkipBootROM = function (doEnable) {
    doEnable = doEnable | 0;
    this.Iodine.toggleSkipBootROM(doEnable | 0);
}
iodineGBAWorkerGfxShim.prototype.toggleDynamicSpeed = function (doEnable) {
    doEnable = doEnable | 0;
    this.Iodine.toggleDynamicSpeed(doEnable | 0);
}
iodineGBAWorkerGfxShim.prototype.toggleOffthreadGraphics = function (doEnable) {
    doEnable = doEnable | 0;
    this.Iodine.toggleOffthreadGraphics(doEnable | 0);
}
iodineGBAWorkerGfxShim.prototype.attachSpeedHandler = function (speed) {
    this.Iodine.attachSpeedHandler(speed);
}
iodineGBAWorkerGfxShim.prototype.attachPlayStatusHandler = function (playStatus) {
    this.Iodine.attachPlayStatusHandler(playStatus);
}
iodineGBAWorkerGfxShim.prototype.keyDown = function (keyCode) {
    keyCode = keyCode | 0;
    this.Iodine.keyDown(keyCode | 0);
}
iodineGBAWorkerGfxShim.prototype.keyUp = function (keyCode) {
    keyCode = keyCode | 0;
    this.Iodine.keyUp(keyCode | 0);
}
iodineGBAWorkerGfxShim.prototype.incrementSpeed = function (newSpeed) {
    newSpeed = +newSpeed;
    this.Iodine.incrementSpeed(+newSpeed);
}
iodineGBAWorkerGfxShim.prototype.setSpeed = function (newSpeed) {
    newSpeed = +newSpeed;
    this.Iodine.setSpeed(+newSpeed);
}
iodineGBAWorkerGfxShim.prototype.attachBIOS = function (BIOS) {
    this.Iodine.attachBIOS(BIOS);
}
iodineGBAWorkerGfxShim.prototype.attachROM = function (ROM) {
    this.Iodine.attachROM(ROM);
}
iodineGBAWorkerGfxShim.prototype.exportSave = function () {
    this.Iodine.exportSave();
}
iodineGBAWorkerGfxShim.prototype.attachSaveExportHandler = function (saveExport) {
    this.Iodine.attachSaveExportHandler(saveExport);
}
iodineGBAWorkerGfxShim.prototype.attachSaveImportHandler = function (saveImport) {
    this.Iodine.attachSaveImportHandler(saveImport);
}
iodineGBAWorkerGfxShim.prototype.graphicsHeartBeat = function () {
    //If graphics callback handle provided and we got a buffer reference:
    if (this.gfx && gfxCounters) {
        //Copy the buffer out to local:
        this.consumeGraphicsBuffer();
        //Wake up the producer thread:
        Atomics.notify(gfxCounters, 2, 1);
    }
}
iodineGBAWorkerGfxShim.prototype.consumeGraphicsBuffer = function () {
    //Load the counter values:
    var start = gfxCounters[0] | 0;              //Written by this thread.
    var end = Atomics.load(gfxCounters, 1) | 0;  //Written by the other thread.
    //Don"t process if nothing to process:
    if ((end | 0) == (start | 0)) {
        //Buffer is empty:
        return;
    }
    //Copy samples out from the ring buffer:
    do {
        //Hardcoded for 2 buffers for a triple buffer effect:
        this.gfx.copyBuffer(gfxBuffers[start & 0x1]);
        start = ((start | 0) + 1) | 0;
    } while ((start | 0) != (end | 0));
    //Update the starting position counter to match the end position:
    //Let the other Atomic loads/stores naturally flush this value:
    gfxCounters[0] = end | 0;
}
