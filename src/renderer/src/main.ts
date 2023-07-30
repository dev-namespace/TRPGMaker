import * as PIXI from "pixi.js";

import "./assets/index.css";
import rootStore from "./store";
import { action, flow, runInAction, when } from "mobx";
// import { addStaticSprite } from "./features/engine/static";
import { Frame } from "./features/engine/test";

const { Engine, Assets } = rootStore;
const { Sprite } = rootStore.Engine;

Engine.start(document.body);

const frame = new Frame(200, 200, 100, 100, 0xff0000);
Engine.addEntity(frame);

frame.move(100, 100);

runInAction(() => {
    frame.color = 0x00ff00;
    // frame.x = 100;
    frame.move(300, 300);
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

    // addStaticSprite(50, 0, "pointer");
    const sprite = Engine.Sprite.add(0, 0, "dragon");
    sprite.animation = "dragon_walking";
    sprite.loop = true;
    sprite.playing = true;

    // Sprite.move(sprite, x, y);
    // sprite.move();

    setTimeout(
        action(() => {
            sprite.loop = false;
        }),
        2000,
    );

    yield when(() => sprite.animationDone);
    sprite.animation = "dragon_attack";
})();
