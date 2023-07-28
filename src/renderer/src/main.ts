import * as PIXI from "pixi.js";
import { Assets } from "pixi.js";

import "./assets/index.css";
import rootStore from "./store";
import { makeFrame } from "./features/engine/frame";
import { runInAction, when } from "mobx";

// const { Engine, Assets } = rootStore;
const { Engine } = rootStore;

Engine.start();

const frame = makeFrame(0, 0, 100, 100, 0xff0000);
Engine.add(frame);

runInAction(() => {
    Engine.entities[frame.id].color = 0x00ff00;
    Engine.entities[frame.id].x = 100;
});

when(
    () => Engine.app,
    () => {
        console.log("!2 app created");
    },
);

// (async function () {
//     // @TODO -> move this logic go Assets
//     const asset = await window.api.getAsset("pointer.png");
//     const blob = new Blob([asset], { type: "image/png" });
//     const url = URL.createObjectURL(blob);
//     const texture = PIXI.Texture.from(url);
//     PIXI.utils.TextureCache["pointer"] = texture;

//     const t = PIXI.utils.TextureCache["pointer"];
//     const sprite = new PIXI.Sprite(t);
//     Engine.stage.addChild(sprite);
// })();

(async function () {
    Assets.add("pointer", "images/pointer.png");
    const t = await Assets.load("pointer");
    console.log("!2 texture", t);

    const sprite = new PIXI.Sprite(t);
    Engine.stage.addChild(sprite);
})();
