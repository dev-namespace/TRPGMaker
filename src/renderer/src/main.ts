import * as PIXI from "pixi.js";

import "./assets/index.css";
import rootStore from "./store";
import { action, flow, runInAction, when } from "mobx";
// import { addStaticSprite } from "./features/engine/static";
import Frame from "./features/engine/frame";
import { Sprite } from "./features/engine/sprite";
import { testFramePositioning, testFrames } from "./performance/frames";

const { Engine, Assets } = rootStore;

Engine.start(document.body);

// const frame = new Frame(100, 100, 100, 100, 0xff0000);
// Engine.add(frame);
// frame.moveTo(200, 200, { speed: 0.2 });

testFramePositioning(1000);

// setTimeout(
//     action(() => {
//         frame.x = 200;
//         frame.y = 200;
//     }),
//     1000,
// );

when(
    () => !!Engine.app,
    () => {
        console.log("!2 app created");
    },
);

Assets.add("pointer", "images/pointer.png");
Assets.add("dragon", "spritesheets/dragon/spritesheet.json");

flow(function* () {
    yield Assets.load("dragon");
    // const sprite = Engine.add(new Sprite(0, 0, "dragon", "dragon_walking"));
    // sprite.playing = true;
    // sprite.loop = true;

    // yield when(() => sprite.animationDone);
    // sprite.animation = "dragon_attack";
})();
