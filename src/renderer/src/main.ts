import * as PIXI from "pixi.js";

import "./assets/index.css";
import rootStore from "./store";
import { makeFrame } from "./features/engine/frame";
import { runInAction, when } from "mobx";
import { addSprite } from "./features/engine/sprite";
import { addStaticSprite } from "./features/engine/static";

const { Engine, Assets } = rootStore;

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

(function () {
    Assets.add("pointer", "images/pointer.png");
    Assets.add("dragon", "spritesheets/dragon/spritesheet.json");

    const sprite = addSprite(0, 0, "dragon");
    sprite.animation = "dragon_idle";
    addStaticSprite(0, 0, "pointer");

    // setTimeout(() => {
    //     addStaticSprite(0, 0, "pointer");
    // }, 100);

    // setTimeout(() => {
    //     sprite.animation = "dragon_attack";
    // }, 500);
    // sprite.playing = true;
})();
