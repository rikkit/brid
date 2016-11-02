/// <reference path="../../typings/index.d.ts" />
import {DrawArea, FlowDirection} from "./utils";

export abstract class Layer {
    protected canvasArea :DrawArea;

    constructor (public name :string) {
    }

    initialise(canvasArea :DrawArea) {
        this.canvasArea = canvasArea;
    }

    abstract update() :void;
    abstract render(canvas :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea;
    abstract addWidget(widgetRoot :JQuery) :void;
}

// Fill the whole canvas area with the given style
export class OverlayLayer extends Layer {
    
    constructor (public name :string, public fillStyle :string){
        super(name);
    }

    update() {

    }

    render(context :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea{
        context.fillStyle = this.fillStyle;
        targetArea.fillRect(context);

        return targetArea;
    }

    addWidget(widgetRoot :JQuery) :void {
    }
}

export class MarqueeLayer extends Layer {
    private x :number;
    private textArea :JQuery;

    constructor (public name :string, public text :string){
        super(name);
    }

    initialise(canvasArea :DrawArea){    
        super.initialise(canvasArea);
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

    addWidget(widgetRoot :JQuery) :void {
        this.textArea = $($.parseHTML('<input type="text"></input>'));
        this.textArea.val(this.text);

        widgetRoot.append(this.textArea);
    }
}

export class HeadlineLayer extends Layer {
    private textArea :JQuery;

    constructor(public name :string, public text :string) {
        super(name);
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

    render(context :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea {
        let lines = this.bisectString(this.text);
        if (lines.length == 0) {
            return;
        }

        console.debug("headline layer: split %s into %s", this.text, lines)
        
        const baselineFontHeight = 20;
        var currentVerticalOffset :number = targetArea.originY;
        for (let line of lines) {            
            context.font = baselineFontHeight + "px spinner"; // reset context for remeasuring

            // measure the length and scale up the font so each line fits the whole width
            let lineWidth = context.measureText(line).width;
            if (lineWidth == 0) {
                break;
            }

            let scaleFactor = targetArea.width / lineWidth;
            let fontHeight = baselineFontHeight * scaleFactor;

            context.font = fontHeight + "px spinner";
            context.fillStyle = "#eee";
            context.fillText(line, targetArea.originX, currentVerticalOffset + fontHeight, targetArea.width);
            currentVerticalOffset += fontHeight;
        }

        return new DrawArea(
            targetArea.originX,
            targetArea.originY,
            targetArea.width,
            currentVerticalOffset);
    }

    addWidget(widgetRoot :JQuery) :void {
        this.textArea = $($.parseHTML('<input type="text"></input>'));
        this.textArea.val(this.text);

        widgetRoot.append(this.textArea);
    }
}

export class CrossLayer extends Layer {
    private colourPicker :JQuery;
    private colour :tinycolorInstance;

    constructor (public name :string) {
        super(name);
    }

    initialise(canvasArea :DrawArea) {
        super.initialise(canvasArea);

        this.colourPicker.spectrum({
            color: "#F74700"
        });
    }

    update() :void {
        this.colour = this.colourPicker.spectrum('get');
    }

    render(canvas :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea {
        canvas.globalCompositeOperation = "darken";

        let crossArea = targetArea; //TODO margin
        canvas.beginPath();
        canvas.moveTo(crossArea.originX, crossArea.originY);
        canvas.lineTo(crossArea.limitX, crossArea.limitY);
        canvas.moveTo(crossArea.limitX, crossArea.originY);
        canvas.lineTo(crossArea.originX, crossArea.limitY);
        canvas.strokeStyle = this.colour.toHexString();
        canvas.lineWidth = 35;
        canvas.stroke();
        
        return targetArea;
    }

    addWidget(widgetRoot :JQuery) :void {
        this.colourPicker = $($.parseHTML('<input type="text"></input>'));
        
        widgetRoot.append(this.colourPicker);
    }
}

export class StackLayer extends Layer {    
    constructor (public name :string, public orientation :FlowDirection, public children :Layer[]) {
        super(name);
    }

    initialise(canvasArea :DrawArea) {
        super.initialise(canvasArea);

        for (let childLayer of this.children) {
            childLayer.initialise(canvasArea);
        }
    }

    update() :void {
        for (let childLayer of this.children) {
            childLayer.update();
        }
    }

    private fitDrawArea(whole :DrawArea, subtract :DrawArea) :DrawArea {
        if (this.orientation == FlowDirection.TopDown) {
            return new DrawArea(
                whole.originX,
                whole.originY + subtract.height,
                whole.width,
                whole.height - subtract.height
            );
        }
        else if (this.orientation == FlowDirection.LeftRight) {
            return new DrawArea(
                whole.originX + subtract.width,
                whole.originY,
                whole.width - subtract.width,
                whole.height
            );
        }
        else {
            throw new Error("Unknown flow direction");
        }
    }

    render(canvas :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea {
        canvas.globalCompositeOperation = "source-over";

        let renderedArea :DrawArea = null;
        let newTargetArea = targetArea;
        for (let layer of this.children) {
            renderedArea = layer.render(canvas, newTargetArea);
            if (!renderedArea) {
                continue;
            }

            newTargetArea = this.fitDrawArea(newTargetArea, renderedArea);
        }

        return targetArea;
    }

    addWidget(widgetRoot :JQuery) :void {
        for (let childLayer of this.children) {
            childLayer.addWidget(widgetRoot);
        }
    }
}
