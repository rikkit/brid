/// <reference path="../../typings/index.d.ts" />
import {DrawArea} from "./drawarea";

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
    abstract render(canvas :CanvasRenderingContext2D) :DrawArea;
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

    render(context :CanvasRenderingContext2D) :DrawArea{
        context.fillStyle = this.fillStyle;
        this.targetArea.fillRect(context);

        return this.targetArea;
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

    render(context :CanvasRenderingContext2D) :DrawArea {
        context.font = "20px spinner";
        context.fillStyle = "#111";
        context.fillText(this.text, this.x, 20);

        return new DrawArea(
            this.canvasArea.originX,
            this.canvasArea.originY,
            this.canvasArea.width,
            20
        );
    }

    buildWidget() :JQuery{
        this.textArea = $($.parseHTML('<input type="text"></input>'));
        this.textArea.val(this.text);
        
        return this.textArea;
    }
}

export class HeadlineLayer extends Layer {
    private textArea :JQuery;

    constructor(public name :string, public text :string) {
        super(name);
    }

    initialise(canvasArea :DrawArea, targetArea :DrawArea) {
        super.initialise(canvasArea, targetArea);
    }

    update() {
        this.text = this.textArea.val();
    }

    private bisectString(text :string) :string[] {
        if (text.length <= 0) {
            return [];
        }

        let regex = /\s+/g;
        var indexes :number[][] = [];

        var match;
        while ((match = regex.exec(text)) != null) {
            let pair = [match.index, match.index+match[0].length];
            console.debug("headline layer bisect: whitespace at %s", pair);
            indexes.push(pair);
        }

        var midpointIndexPair :number[] = null;
        let midpoint = text.length / 2;
        for (let indexPair of indexes) {
            if (midpoint > indexPair[0] && midpoint < indexPair[1]) {
                midpointIndexPair = indexPair;
            }
        }

        if (!midpointIndexPair) {
            midpointIndexPair = indexes.length > 0
                ? indexes[indexes.length - 1]
                : [text.length, text.length];
        }

        return [
            text.substr(0, midpointIndexPair[0]),
            text.substr(midpointIndexPair[1], text.length - 1)
        ];
    } 

    render(context :CanvasRenderingContext2D) :DrawArea {
        let lines = this.bisectString(this.text);
        if (lines.length == 0) {
            return;
        }

        console.debug("headline layer: split %s into %s", this.text, lines)
        
        const baselineFontHeight = 20;
        var currentVerticalOffset :number = 0;
        for (let line of lines) {            
            context.font = baselineFontHeight + "px spinner"; // reset context for remeasuring

            // measure the length and scale up the font so each line fits the whole width
            let lineWidth = context.measureText(line).width;
            let scaleFactor = this.targetArea.width / lineWidth;
            let fontHeight = baselineFontHeight * scaleFactor;

            context.font = fontHeight + "px spinner";
            context.fillStyle = "#eee";
            context.fillText(line, this.targetArea.originX, currentVerticalOffset + fontHeight, this.targetArea.width);
            currentVerticalOffset += fontHeight;
        }

        return new DrawArea(
            this.targetArea.originX,
            this.targetArea.originY,
            this.targetArea.width,
            currentVerticalOffset);
    }

    buildWidget() :JQuery {
        this.textArea = $($.parseHTML('<input type="text"></input>'));
        this.textArea.val(this.text);

        return this.textArea;
    }
}

export class CrossLayer extends Layer {
    private colourPicker :JQuery;
    private colour :tinycolorInstance;

    constructor (public name :string) {
        super(name);
    }

    initialise(canvasArea :DrawArea, targetArea :DrawArea) {
        this.canvasArea = canvasArea;
        this.targetArea = targetArea;

        this.colourPicker.spectrum({
            color: "#F74700"
        });
    }

    update() :void {
        this.colour = this.colourPicker.spectrum('get');
    }

    render(canvas :CanvasRenderingContext2D) :DrawArea {
        canvas.globalCompositeOperation = "darken";

        let crossArea = this.targetArea; //TODO margin
        canvas.beginPath();
        canvas.moveTo(crossArea.originX, crossArea.originY);
        canvas.lineTo(crossArea.limitX, crossArea.limitY);
        canvas.moveTo(crossArea.limitX, crossArea.originY);
        canvas.lineTo(crossArea.originX, crossArea.limitY);
        canvas.strokeStyle = this.colour.toHexString();
        canvas.lineWidth = 35;
        canvas.stroke();

        //this.targetArea.fillRect(canvas);

        return this.targetArea;
    }

    buildWidget() :JQuery {
        this.colourPicker = $($.parseHTML('<input type="text"></input>'));
        return this.colourPicker;
    }
}