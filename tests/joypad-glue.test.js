"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function createKeyboard() {
    const saved = new Map();
    const context = vm.createContext({
        document: { title: "GBA Online" },
        location: { hash: "" },
        navigator: { userAgent: "" },
        window: {},
        console: { log() {} },
        setValue(key, value) { saved.set(key, value); }
    });
    for (const file of [
        "modules/iodineGBA/includes/TypedArrayShim.js",
        "modules/CoreGlueCode.js",
        "modules/GUIGlueCode.js",
        "modules/JoyPadGlueCode.js",
        "modules/iodineGBA/core/Emulator.js",
        "modules/iodineGBA/core/JoyPad.js"
    ]) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context);
    }
    const joypad = new context.GameBoyAdvanceJoyPad({});
    joypad.initialize();
    const emulator = new context.GameBoyAdvanceEmulator();
    emulator.IOCore = { joypad };
    emulator.emulatorStatus = 0;
    context.IodineGUI.Iodine = emulator;
    return {
        context,
        joypad,
        emulator,
        saved,
        down(keyCode) { context.keyDown({ keyCode, preventDefault() {} }); },
        up(keyCode) { context.keyUpPreprocess({ keyCode }); },
        map(group, index) {
            context.IodineGUI.toMap = context.IodineGUI.defaults[group];
            context.IodineGUI.toMapIndice = index;
        }
    };
}

test("rebinding a GBA key does not press the old game button", () => {
    const keyboard = createKeyboard();
    keyboard.map("keyZonesGBA", 0);
    keyboard.down(37);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3FF);
    keyboard.up(37);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3FF);
    assert.equal(keyboard.saved.get("key_a"), 37);
    assert.equal(keyboard.context.IodineGUI.toMap, null);
});

test("rebinding an emulator shortcut does not press a game button or run the shortcut", () => {
    const keyboard = createKeyboard();
    let speedChanges = 0;
    keyboard.emulator.incrementSpeed = () => { speedChanges++; };
    keyboard.map("keyZonesControl", 2);
    keyboard.down(88);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3FF);
    keyboard.up(88);
    assert.equal(speedChanges, 0);
    assert.equal(keyboard.saved.get("key_speedup"), 88);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3FF);
});

test("releasing a key held before rebinding releases its old GBA mapping", () => {
    const keyboard = createKeyboard();
    keyboard.down(37);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3DF);
    keyboard.map("keyZonesGBA", 5);
    keyboard.up(37);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3FF);
    assert.equal(keyboard.saved.get("key_left"), 37);
});

test("a shared game and emulator key releases the game button before pausing", () => {
    const keyboard = createKeyboard();
    keyboard.context.IodineGUI.defaults.keyZonesControl[6] = 88;
    keyboard.context.IodineGUI.isPlaying = true;
    keyboard.emulator.pause = () => { keyboard.emulator.emulatorStatus = 0x10; };
    keyboard.down(88);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3FE);
    keyboard.up(88);
    assert.equal(keyboard.emulator.emulatorStatus, 0x10);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3FF);
});

test("normal game input, emulator shortcuts and unrelated keys still work", () => {
    const keyboard = createKeyboard();
    let speedChanges = 0;
    keyboard.emulator.incrementSpeed = () => { speedChanges++; };
    keyboard.down(88);
    keyboard.down(37);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3DE);
    keyboard.up(88);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3DF);
    keyboard.up(37);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3FF);
    keyboard.down(52);
    keyboard.up(52);
    assert.equal(speedChanges, 1);
    keyboard.down(81);
    keyboard.up(81);
    assert.equal(keyboard.joypad.readKeyStatus16(), 0x3FF);
    assert.equal(keyboard.saved.size, 0);
});
