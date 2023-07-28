import * as PIXI from "pixi.js";

import "./assets/index.css";
import rootStore from "./store";
import { makeFrame } from "./features/engine/frame";
import { runInAction, when } from "mobx";
import {
    addSprite,
    makeSprite,
    setAnimation,
    updateSprite,
} from "./features/engine/sprite";

const { Engine, Assets } = rootStore;
// const { Engine } = rootStore;

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
    Assets.add("dragon", "spritesheets/dragon/spritesheet.json");
    const sprite = addSprite(0, 0, "dragon");

    Engine.entities[sprite.id].animation = "dragon_attack";

    // runInAction(() => {
    //     Engine.entities[sprite.id].animation = "dragon_attack";
    // });

    // Engine.entities[sprite.id].animation = "dragon_attack";
    // updateSprite(sprite, (sprite) => {
    //     sprite.animation = "dragon_attack";
    // });
    // sprite.animation = "dragon_attack";

    // setTimeout(() => {
    //     // runInAction(() => {
    //     sprite.animation = "dragon_attack";
    //     console.log("!2 changing");
    //     // });
    // }, 2000);
    sprite.playing = true;
    console.log("!2 sprite", JSON.stringify(sprite));
})();
