export class DrawArea {
    constructor(
        public originX :number,
        public originY :number,
        public width :number,
        public height :number
    ) {

    }

    fillRect(context :CanvasRenderingContext2D) {
        context.fillRect(this.originX, this.originY, this.width, this.height);
    }
}
