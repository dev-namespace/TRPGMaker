import * as PIXI from "pixi.js";

export interface RectData {
    x: number;
    y: number;
    width: number;
    height: number;
    color: number;
    rect?: PIXI.Graphics;
}

export function drawRect({ x, y, width, height, color, rect }: RectData) {
    let graphics = rect || new PIXI.Graphics();
    graphics.clear();
    graphics.beginFill(color);
    graphics.drawRect(x, y, width, height);
    graphics.endFill();
    return graphics;
}
