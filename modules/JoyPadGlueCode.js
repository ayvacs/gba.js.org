"use strict";
function keyDown(e) {
    if (IodineGUI.toMap) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        return;
    }
    var keyCode = e.keyCode | 0;
    for (var keyMapIndex = 0; (keyMapIndex | 0) < 10; keyMapIndex = ((keyMapIndex | 0) + 1) | 0) {
        if ((IodineGUI.defaults.keyZonesGBA[keyMapIndex | 0] | 0) == (keyCode | 0)) {
            IodineGUI.Iodine.keyDown(keyMapIndex | 0);
            if (e.preventDefault) {
                e.preventDefault();
            }
            return;
        }
    }
}
function keyUpGBA(keyCode) {
    keyCode = keyCode | 0;
    for (var keyMapIndex = 0; (keyMapIndex | 0) < 10; keyMapIndex = ((keyMapIndex | 0) + 1) | 0) {
        if ((IodineGUI.defaults.keyZonesGBA[keyMapIndex | 0] | 0) == (keyCode | 0)) {
            IodineGUI.Iodine.keyUp(keyMapIndex | 0);
            return;
        }
    }
}
function keyUp(keyCode) {
    keyCode = keyCode | 0;
    for (var keyMapIndex = 0; (keyMapIndex | 0) < 8; keyMapIndex = ((keyMapIndex | 0) + 1) | 0) {
        if ((IodineGUI.defaults.keyZonesControl[keyMapIndex | 0] | 0) == (keyCode | 0)) {
            keyboardEmulatorControl(keyMapIndex | 0);
            return true;
        }
    }
    return false;
}
function keyUpPreprocess(e) {
    var keyCode = e.keyCode | 0;
    //Release the old game binding before changing mappings or pausing the emulator:
    keyUpGBA(keyCode);
    //If we"re not mapping a key:
    if (!IodineGUI.toMap) {
        //Check for emulator binding:
        keyUp(keyCode | 0);
    }
    else {
        //Map a key binding:
        IodineGUI.toMap[IodineGUI.toMapIndice | 0] = keyCode | 0;
        IodineGUI.toMap = null;
        saveKeyBindings();
    }
}
function keyboardEmulatorControl(keyCode) {
    keyCode = keyCode | 0;
    switch (keyCode | 0) {
        case 0:
            stepVolume(-0.04);
            break;
        case 1:
            stepVolume(0.04);
            break;
        case 2:
            IodineGUI.Iodine.incrementSpeed(0.05);
            break;
        case 3:
            IodineGUI.Iodine.incrementSpeed(-0.05);
            break;
        case 4:
            IodineGUI.Iodine.setSpeed(1);
            break;
        case 5:
            toggleFullScreen();
            break;
        case 6:
            togglePlayState();
            break;
        case 7:
            IodineGUI.Iodine.restart();
    }
}
function toggleFullScreen() {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
        else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
        else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        }
        else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}
function togglePlayState() {
    if (IodineGUI.isPlaying) {
        IodineGUI.Iodine.pause();
    }
    else {
        IodineGUI.Iodine.play();
    }
}
