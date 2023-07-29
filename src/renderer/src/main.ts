import * as PIXI from "pixi.js";

import "./assets/index.css";
import rootStore from "./store";
import { makeFrame } from "./features/engine/frame";
import { action, autorun, flow, runInAction, when } from "mobx";
import { addSprite } from "./features/engine/sprite";
import { addStaticSprite } from "./features/engine/static";

const { Engine, Assets } = rootStore;

Engine.start(document.body);

const frame = Engine.Frame.add(0, 0, 100, 100, 0xff0000);

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

flow(function* () {
    Assets.add("pointer", "images/pointer.png");
    Assets.add("dragon", "spritesheets/dragon/spritesheet.json");

    addStaticSprite(50, 0, "pointer");
    const sprite = addSprite(0, 0, "dragon");
    sprite.animation = "dragon_walking";
    sprite.loop = true;
    sprite.playing = true;

    setTimeout(
        action(() => {
            sprite.loop = false;
        }),
        2000,
    );

    yield when(() => sprite.animationDone);
    sprite.animation = "dragon_attack";
})();
