import * as PIXI from "pixi.js";

import "./assets/index.css";
import rootStore from "./store";
import { action, flow, runInAction, when } from "mobx";
import Frame from "./features/engine/frame";
import AnimatedSprite from "./features/engine/animSprite";
import Container from "./features/engine/container";
import Sprite from "./features/engine/sprite";
import { testFramePositioning, testFrames } from "./performance/frames";
import {
    testSpriteMovement,
    testSpritePositioning,
} from "./performance/sprites";

const { Engine, Assets } = rootStore;

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

Engine.start(document.body);

// testFramePositioning(1000);
// testSpriteMovement(10);

when(
    () => !!Engine.app,
    () => {
        console.log("!2 app created");
    },
);

Assets.add("pointer", "images/pointer.png");
Assets.add("dragon", "spritesheets/dragon/spritesheet.json");

flow(function* () {
    // yield Assets.load("pointer");
    // const container = Engine.add(new Container(0, 0));
    // const pointer = Engine.add(new Sprite(0, 0, "pointer"));
    // container.add(pointer);
    // container.setScale(2, 2);

    // container.setPosition(100, 100);

    // pointer.moveTo(100, 100, { duration: 500 });

    // yield Assets.load("pointer");
    // const pointer = Engine.add(new Sprite(0, 0, "pointer"));
    // pointer.setScale(2, 2);

    // setTimeout(() => {
    //     pointer.moveTo(50, 50, { duration: 300 });
    // }, 500);

    yield Assets.load("dragon");
    const sprite = Engine.add(
        new AnimatedSprite(0, 0, "dragon", "dragon_idle"),
    );
    sprite.setScale(3, 3);
    sprite.setAnimation("dragon_idle");
    setTimeout(async () => {
        await sprite.animate("dragon_attack", {
            duration: 400,
            curve: "ease-in",
        });
        // sprite.setAnimation("dragon_idle");
        // sprite.loop = true;
    }, 1000);

    // yield when(() => sprite.animationDone);
    // sprite.animation = "dragon_attack";
})();
