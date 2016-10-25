/// <reference path="../typings/index.d.ts" />
import {MixingDeck} from "./mixingdeck/mixingdeck"

$(document).ready(function () {
    let deckRoot = $(".mixing-deck").first();
    let mixingDeck = new MixingDeck(deckRoot);
    mixingDeck.initialise();

    const TARGET_FPS = 30;
    setInterval(function() {
        mixingDeck.update();
        mixingDeck.render();
    }, 1000 / TARGET_FPS);
})