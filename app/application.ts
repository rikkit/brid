/// <reference path="../typings/index.d.ts" />
import {MixingDeck} from "./mixingdeck/mixingdeck"

$(document).ready(function () {
    let deckRoot = $(".mixing-deck").first();
    let mixingDeck = new MixingDeck(deckRoot);
    mixingDeck.addWidgets();
    
    let resizeTimer;
    const resizeTimeoutMs = 100;
    function onViewportResize() {
        mixingDeck.initialise();
    }

    const TARGET_FPS = 30;
    setInterval(function() {
        mixingDeck.update();
        mixingDeck.render();
    }, 1000 / TARGET_FPS);

    // http://stackoverflow.com/a/5490021
    window.onresize = function(){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(onViewportResize, resizeTimeoutMs);
    };
})

