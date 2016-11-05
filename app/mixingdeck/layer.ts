/// <reference path="../../typings/index.d.ts" />
import {DrawArea, FlowDirection, GridRenderBehaviour} from "./utils";

export abstract class Layer {
    protected canvasArea :DrawArea;

    constructor (public name :string) {
    }

    initialise(canvasArea :DrawArea) {
        this.canvasArea = canvasArea;
    }

    abstract update() :void;
    abstract measure(context :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea; // return null means will fill all space provided to it
    abstract render(context :CanvasRenderingContext2D, targetArea :DrawArea) :void;
    abstract addWidget(widgetRoot :JQuery) :void;
}

// Fill the whole canvas area with the given style
export class FillLayer extends Layer {
    
    constructor (public name :string, public fillStyle :string){
        super(name);
    }

    update() {

    }

    measure(canvas :CanvasRenderingContext2D, targetArea :DrawArea) {
        return null;
    }

    render(context :CanvasRenderingContext2D, targetArea :DrawArea) :void {
        context.fillStyle = this.fillStyle;
        targetArea.fillRect(context);
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

    measure(context :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea {
        return new DrawArea(
            this.canvasArea.originX,
            this.canvasArea.originY,
            this.canvasArea.width,
            20
        );
    }

    render(context :CanvasRenderingContext2D) :void {
        context.font = "20px spinner";
        context.fillStyle = "#111";
        context.fillText(this.text, this.x, 20);
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
            //console.debug("headline layer bisect: whitespace at %s", pair);
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

    private measureResult;

    measure(context :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea {
        let lines = this.bisectString(this.text);
        if (lines.length == 0) {
            return DrawArea.None();
        }

        this.measureResult = {
            lines: []
        }

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
            
            this.measureResult.lines.push({
                line: line,
                fontHeight: fontHeight,
                verticalOffset: currentVerticalOffset
            });
            currentVerticalOffset += fontHeight;
        }

        currentVerticalOffset += 5; // add a bottom margin        

        return new DrawArea(
            targetArea.originX,
            targetArea.originY,
            targetArea.width,
            currentVerticalOffset);
    }

    render(context :CanvasRenderingContext2D, targetArea :DrawArea) :void {
        for(let measuredLine of this.measureResult.lines) {
            context.font = measuredLine.fontHeight + "px spinner";
            context.fillStyle = "#eee";
            context.fillText(measuredLine.line, targetArea.originX, measuredLine.verticalOffset + measuredLine.fontHeight, targetArea.width);
        }
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

    constructor (public name :string, public startColour :string) {
        super(name);
    }

    initialise(canvasArea :DrawArea) {
        super.initialise(canvasArea);

        this.colourPicker.spectrum({
            color: this.startColour
        });
    }

    update() :void {
        this.colour = this.colourPicker.spectrum('get');
    }

    measure(context :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea {        
        return targetArea;
    }

    render(canvas :CanvasRenderingContext2D, targetArea :DrawArea) :void {
        canvas.globalCompositeOperation = "darken";

        let crossArea = targetArea; //TODO margin
        canvas.beginPath();
        canvas.moveTo(crossArea.originX, crossArea.originY);
        canvas.lineTo(crossArea.limitX, crossArea.limitY);
        canvas.moveTo(crossArea.limitX, crossArea.originY);
        canvas.lineTo(crossArea.originX, crossArea.limitY);
        canvas.strokeStyle = this.colour.toHexString();
        canvas.lineWidth = targetArea.width / 4.5;
        canvas.stroke();
    }

    addWidget(widgetRoot :JQuery) :void {
        this.colourPicker = $($.parseHTML('<input type="text"></input>'));
        
        widgetRoot.append(this.colourPicker);
    }
}

abstract class ContainerLayer extends Layer {
    constructor(public name :string, protected children :Layer[]){
        super(name);
    }

    initialise(canvasArea :DrawArea) {
        super.initialise(canvasArea);

        for (let childLayer of this.children) {
            childLayer.initialise(canvasArea);
        }
    }

    measure(context :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea {        
        return targetArea;
    }

    addWidget(widgetRoot :JQuery) :void {
        for (let childLayer of this.children) {
            childLayer.addWidget(widgetRoot);
        }
    }

    update() :void {
        for (let childLayer of this.children) {
            childLayer.update();
        }
    }
}

// renders its children on top of each other
export class GridLayer extends ContainerLayer {
    private largestMeasure :DrawArea;

    constructor (name :string, public renderBehavior :GridRenderBehaviour, children :Layer[]) {
        super(name, children);
    }

    measure(context :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea {        
        let childMeasurements :DrawArea[] = [];
        for (let childLayer of this.children) {
            let measurement = childLayer.measure(context, targetArea);
            if (measurement) {
                childMeasurements.push(measurement);
            }
        }

        // only return after childLayer.measure has been called for each layer, even if we know it's pointless
        if (this.renderBehavior == GridRenderBehaviour.Expand) {
            return targetArea;
        }

        if (childMeasurements.length == 0) {
            return DrawArea.None();
        }
        
        let smallestX :number, smallestY :number, largestX :number, largestY :number;
        for (let measurement of childMeasurements) {
            if (!smallestX || measurement.originX < smallestX) smallestX = measurement.originX;
            if (!smallestY || measurement.originY < smallestY) smallestY = measurement.originY;
            if (!largestX || measurement.limitX > largestX) largestX = measurement.limitX;
            if (!largestY || measurement.limitY > largestY) largestY = measurement.limitY;
        }

        this.largestMeasure = new DrawArea(smallestX, smallestY, largestX - smallestX, largestY - smallestY);
        return this.largestMeasure;
    }

    render(canvas :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea {
        canvas.globalCompositeOperation = "source-over";

        let childTargetArea = this.renderBehavior == GridRenderBehaviour.Compress
            ? this.largestMeasure
            : targetArea;

        for (let layer of this.children) {
            layer.render(canvas, childTargetArea);
        }

        return targetArea;
    }
}

// stacks its children horizontally or vertically
export class StackLayer extends ContainerLayer {    
    constructor (name :string, public orientation :FlowDirection, children :Layer[]) {
        super(name, children);
    }

    render(canvas :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea {
        canvas.globalCompositeOperation = "source-over";

        let renderedArea :DrawArea = null;
        let newTargetArea = targetArea;
        for (let layer of this.children) {
            renderedArea = layer.measure(canvas, newTargetArea);
            layer.render(canvas, newTargetArea);
            if (!renderedArea) {
                continue;
            }

            newTargetArea = this.fitDrawArea(newTargetArea, renderedArea);
        }

        return targetArea;
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
}

export class CentredTextLayer extends Layer {
    private textArea :JQuery;
    private measureResult;

    constructor(name :string, public text :string) {
        super(name)
    }

    addWidget(root :JQuery) :void {
        this.textArea = $($.parseHTML('<input type="text"></input>'));
        this.textArea.val(this.text);

        root.append(this.textArea);
    }

    update() :void {
    }

    measure(context :CanvasRenderingContext2D, targetArea :DrawArea) :DrawArea {     
        let fontHeight = targetArea.width / 15;
        let margin = fontHeight / 4;
        
        this.measureResult = {
            fontHeight: fontHeight,
            margin: margin
        };
        
        return new DrawArea(targetArea.originX, targetArea.originY, targetArea.width, fontHeight + (2 * margin));
    }

    render(context :CanvasRenderingContext2D, targetArea :DrawArea) :void {
        context.font = this.measureResult.fontHeight + 'px "Cutive-Regular"';
        this.text = this.textArea.val();
        let nameMargin = (targetArea.width - context.measureText(this.text).width) / 2;

        context.fillStyle = "#111";
        context.fillText(this.text, targetArea.originX + nameMargin, targetArea.originY + this.measureResult.fontHeight + this.measureResult.margin);
    }
}
