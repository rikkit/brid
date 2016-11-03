export class DrawArea {
    public limitX :number;
    public limitY :number;

    constructor(
        public originX :number,
        public originY :number,
        public width :number,
        public height :number
    ) {
        this.limitX = originX + width;
        this.limitY = originY + height;
    }

    fillRect(context :CanvasRenderingContext2D) {
        context.fillRect(this.originX, this.originY, this.width, this.height);
    }

    static None() :DrawArea {
        return new DrawArea(0, 0, 0 ,0);
    }
}

export enum FlowDirection {
    TopDown,
    LeftRight,
    //BottomUp,
    //RightLeft
}

export enum GridRenderBehaviour {
    Compress,
    Expand
}