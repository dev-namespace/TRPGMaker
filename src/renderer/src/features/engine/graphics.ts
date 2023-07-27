import * as PIXI from "pixi.js";

import store from "@renderer/store";

const { app } = store.Engine;

export function drawRectangle() {
    console.log("!2 drawing rectangle");
    let square = new PIXI.Graphics();
    square.beginFill(0xff3300); // Color it red
    square.drawRect(50, 50, 100, 100); // Draw a square with top-left corner at (50, 50), with width and height of 100
    square.endFill();

    app.stage.addChild(square); // Add the square to the stage so it is visible
}
