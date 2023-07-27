import { v4 as uuid } from "uuid";
import { Container, Graphics } from "pixi.js";
import rootStore from "@renderer/store";
import { autorun, runInAction } from "mobx";
import { drawRect } from "./graphics";

const { Engine } = rootStore;

export interface Frame {
    id: string;
    type: "frame";
    x: number;
    y: number;
    width: number;
    height: number;
    color: number;
}

export function makeFrame(x, y, width, height, color = 0xf1f1f1): Frame {
    return {
        id: uuid(),
        type: "frame",
        x,
        y,
        width,
        height,
        color,
    };
}

export function renderFrame(frame) {
    const container = new Container();
    const bg = drawRect(frame);
    container.addChild(bg);

    Engine.frames[frame.id] = frame;
    Engine.containers[frame.id] = container;
    Engine.app.stage.addChild(container);

    // @TODO mask & bg
    // @TODO abstract mapping PIXI.js properties to Observable properties
    // @TODO entity abstraction type="frame"
    autorun(() => {
        const frameData = Engine.frames[frame.id];
        Object.assign(container, {
            x: frameData.x,
            y: frameData.y,
            width: frameData.width,
            height: frameData.height,
        });
        bg.clear();
        drawRect({ ...frameData, x: 0, y: 0, rect: bg });
    });

    runInAction(() => {
        Engine.frames[frame.id].color = 0x00ff00;
        Engine.frames[frame.id].x = 100;
    });
}

// export function frame(x, y, width, height, color = 0xf1f1f1) {
//     const frame = new Container();
//     // Object.assign(frame, {
//     //     x,
//     //     y,
//     //     _width: width,
//     //     _height: height,
//     //     sortableChildren: true,
//     // });

//     const mask = new Graphics();
//     mask.beginFill();
//     mask.drawRect(0, 0, width, height);
//     mask.endFill();

//     frame.mask = frame.addChild(mask);
//     frame.addChild(rect(0, 0, width, height, color));

//     renderFrame(frame);
//     return frame;

//     const id = uuid();

//     return {
//         id,
//         x,
//         y,
//         width,
//         height,
//         color,
//     };
// }

// function renderFrame() {}
