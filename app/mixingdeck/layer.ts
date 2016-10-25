/// <reference path="../../typings/index.d.ts" />
import {DrawArea} from "./DrawArea";

export abstract class Layer {
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

export class TextLayer extends Layer {
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