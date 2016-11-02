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
}
