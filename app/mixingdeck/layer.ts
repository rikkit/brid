/// <reference path="../../typings/index.d.ts" />
import {DrawArea} from "./DrawArea";

export abstract class Layer {
    protected canvasArea :DrawArea;
    protected targetArea :DrawArea;

    constructor (public name :string) {

    }

    initialise(canvasArea :DrawArea, targetArea :DrawArea) {
        this.canvasArea = canvasArea;
        this.targetArea = targetArea;
    }

    abstract update() :void;
    abstract render(canvas :CanvasRenderingContext2D) :void;
    abstract buildWidget() :JQuery;
}

// Fill the whole canvas area with the given style
export class OverlayLayer extends Layer {
    
    constructor (public name :string, public fillStyle :string){
        super(name);
    }

    initialise(canvasArea :DrawArea, targetArea :DrawArea) {
        super.initialise(canvasArea, targetArea);
    }

    update() {

    }

    render(context :CanvasRenderingContext2D) {
        context.fillStyle = this.fillStyle;
        this.targetArea.fillRect(context);
    }

    buildWidget() :JQuery {
        return null;
    }
}

export class MarqueeLayer extends Layer {
    private x :number;
    private textArea :JQuery;

    constructor (public name :string, public text :string){
        super(name);
    }

    initialise(canvasArea :DrawArea, targetArea :DrawArea){    
        super.initialise(canvasArea, targetArea);    
        this.x = this.canvasArea.width;
    }

    update() {
        this.text = this.textArea.val();

        if (this.x < this.canvasArea.originX - 600) {
            this.x = this.canvasArea.width;
        }
        else {
            this.x -= 2;
        }
    }

    render(context :CanvasRenderingContext2D){
        context.font = "20px sans-serif";
        context.fillStyle = "#111";
        context.fillText(this.text, this.x, 20);
    }

    buildWidget() :JQuery{
        this.textArea = $($.parseHTML("<textarea>test</textarea>"));
        
        return this.textArea;
    }
}