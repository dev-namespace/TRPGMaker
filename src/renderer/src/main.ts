import * as PIXI from "pixi.js";

import "./assets/index.css";
import rootStore from "./store";
import { action, flow, runInAction, when } from "mobx";
import { testFramePositioning, testFrames } from "./performance/frames";
import {
    testIsometricSpriteMovement,
    testSpriteMovement,
    testSpritePositioning,
} from "./performance/sprites";
import { AnimatedSprite, Container, Frame, Sprite } from "./features/engine";
import { wait } from "./utils/time";
import { uv } from "./utils/coordinates";
import World from "./features/isometricEngine/world";
import IsometricSprite from "./features/isometricEngine/sprite";
import IsometricAnimatedSprite from "./features/isometricEngine/animatedSprite";

const { Engine, Assets } = rootStore;

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

Engine.start(document.body);

// testFramePositioning(1000);
// testSpriteMovement(10000);
// testIsometricSpriteMovement(1000);

when(
    () => !!Engine.app,
    () => {
        console.log("!2 app created");
    },
);

Assets.add("pointer", "images/pointer.png");
Assets.add("dragon_static", "images/dragon.png");
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
    // pointer.setScale(3, 3);

    // setTimeout(() => {
    //     pointer.moveTo(50, 50, { duration: 300 });
    // }, 500);
    // const frame = Engine.add(new Frame(0, 0, 100, 100));
    // frame.setPosition(100, 100);

    const world = Engine.add(new World(100, 100, 100, 100, 2 / 1));
    world.setScale(2, 2);
    world.debugGround();

    yield Assets.load("pointer");
    const pointer = world.add(new IsometricSprite(0, 0, 0, "pointer"));
    yield pointer.setUVZ(0, 0);
    // yield pointer.moveToUVZ(0, 95, 0, { duration: 1000 });
    // yield pointer.moveToUVZ(50, 50, 0, { duration: 1000 });

    yield Assets.load("dragon");
    const dragon = world.add(new IsometricAnimatedSprite(95, 95, 0, "dragon"));
    dragon.animate("dragon_walking", { duration: 1000 });
    dragon.loop = true;
    // dragon.moveToUVZ(95, 5, 0, { duration: 3000 });

    // const container = Engine.add(new Container(0, 0));
    // container.setScale(3, 3);
    // container.add(world);

    // console.log(world.parent);

    // yield Assets.load("dragon");
    // const sprite = Engine.add(
    //     new AnimatedSprite(0, 0, "dragon", "dragon_idle"),
    // );
    // sprite.setAnimation("dragon_idle");
    // const { x, y } = world.uvz2xy(uv(0, 100));
    // sprite.setPosition(x, y);

    // yield wait(400);
    // yield sprite.animate("dragon_attack", {
    //     duration: 400,
    //     curve: "ease-in",
    // });
    // yield wait(400);
    // sprite.setAnimation("dragon_idle");

    // yield when(() => sprite.animationDone);
    // sprite.animation = "dragon_attack";
})();
