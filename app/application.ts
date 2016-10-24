/// <reference path="../typings/index.d.ts" />

abstract class Layer {
    protected targetArea :DrawArea;

    constructor (public name :string) {

    }

    initialise(targetArea :DrawArea) {
        this.targetArea = targetArea;
    }

    abstract update() :void;
    abstract render(canvas :CanvasRenderingContext2D) :void;
    abstract buildWidget() :JQuery;
}

class DrawArea {
    constructor(
        public originX :number,
        public originY :number,
        public width :number,
        public height :number
    ) {

    }
}

class TextLayer extends Layer {
    private x :number;

    constructor (public name :string, public text :string){
        super(name);
    }

    initialise(targetArea :DrawArea){    
        super.initialise(targetArea);    
        this.x = this.targetArea.width;
    }

    update() {
        if (this.x < this.targetArea.originX - 600) {
            this.x = this.targetArea.width;
        }
        else {
            this.x -= 2;
        }
    }

    render(context :CanvasRenderingContext2D){
        context.strokeText(this.text, this.x, 20);
    }

    buildWidget() :JQuery{
        let textBox = $.parseHTML("<textbox></textbox>");

        return $(textBox);
    }
}

function render(canvas :HTMLCanvasElement, layers :Layer[]) {
    
}

class MixingDeck {
    private canvas :HTMLCanvasElement;
    private context2d :CanvasRenderingContext2D;
    private widgetRoot :JQuery;
    private layers :Layer[];

    constructor(public root :JQuery) {
        this.canvas = root.children(".card-canvas").first()[0] as HTMLCanvasElement;
        this.context2d = this.canvas.getContext("2d");
        this.widgetRoot = root.children("form.widgetRoot").first();
        
        this.layers = [
            new TextLayer(
                "marquee",
                "blade runner id card generator - for all your blade runner id card generating needs"
            ),
        ];
    }

    initialise() {
        for (let layer of this.layers) {
            layer.initialise(new DrawArea(0, 0, this.canvas.width, this.canvas.height))
            this.widgetRoot.append(layer.buildWidget());
        }
    }

    update() {
        for (let layer of this.layers) {
            layer.update();
        }
    }

    render() {
        this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let layer of this.layers) {
            layer.render(this.context2d);
        }
    }
}

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