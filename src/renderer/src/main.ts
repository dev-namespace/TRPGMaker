import * as PIXI from "pixi.js";

import "./assets/index.css";
import rootStore from "./store";
import { flow, when } from "mobx";
import IsometricSprite from "./features/isometricEngine/sprite";
import IsometricAnimatedSprite from "./features/isometricEngine/animatedSprite";
import { IsometricCamera } from "./features/isometricEngine/isometricCamera";
import { World } from "./features/isometricEngine/world";
import { testIsometricSpriteMovement } from "./performance/sprites";

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
    const world = Engine.add(new World(100, 100, 100, 100, 2 / 1));
    world.setScale(3, 3);
    world.debugGround();

    const camera = world.add(new IsometricCamera(100, 0, 0));
    camera.focusUVZ(50, 50, 0);

    // yield Assets.load("pointer");
    // const pointer = world.add(new IsometricSprite(0, 0, 0, "pointer"));

    yield Assets.load("dragon");
    // @TODO: z is not reaching the getZIndex method because the getter does xy->uvz conversion
    const dragon = world.add(new IsometricAnimatedSprite(95, 95, 50, "dragon"));
    dragon.animate("dragon_walking", { duration: 1000 });
    dragon.loop = true;

    for (let i = 9; i > 0; i--) {
        const dragon = world.add(
            new IsometricAnimatedSprite(5 + i * 8, 5 + i * 10, 0, "dragon"),
        );
        dragon.animate("dragon_walking", { duration: 1000 });
        dragon.loop = true;
        dragon.moveToUVZ(95, 5 + i * 10, 0, { speed: 0.05 });
    }

    // yield camera.moveToFocusUVZ(50, 50, 0, { duration: 1000 });
    // yield camera.moveToFocusUVZ(0, 25, 0, { duration: 1000 });
    // yield camera.moveToFocusUVZ(50, 0, 0, { duration: 1000 });
})();
