/// <reference path="../../typings/index.d.ts" />
import {DrawArea} from "./drawarea"
import {Layer, TextLayer} from "./layer";

export class MixingDeck {
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