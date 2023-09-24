import * as PIXI from "pixi.js";

import { flow, when } from "mobx";
import "./assets/index.css";
import IsometricAnimatedSprite from "./features/isometricEngine/IsometricAnimatedSprite";
import { World } from "./features/isometricEngine/World";
import rootStore from "./store";
import IsometricSprite from "./features/isometricEngine/IsometricSprite";

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
    yield Assets.load("pointer");
    yield Assets.load("dragon");
    // const pointer = Engine.add(new Sprite(120, 120, "pointer"));

    // const container = Engine.add(new Container(0, 0));
    // container.setScale(3, 3);
    // container.add(pointer); // @TODO: maybe append instead of add

    // const dragon = Engine.add(new AnimatedSprite(100, 100, "dragon"));
    // container.add(dragon);
    // dragon.animate("dragon_walking", { duration: 1000 });
    // dragon.playing = true;
    // dragon.loop = true;
    // dragon.moveTo(200, 200, { speed: 0.05 });

    // const camera = Engine.add(new Camera(0, 0));
    // camera.moveToFocus(0, 0, { duration: 1000 });

    const world = Engine.add(new World(0, 0, 100, 100, 2 / 1));
    world.setScale(3, 3);
    world.debugGround();

    const pointer = world.add(new IsometricSprite(50, 50, 0, "pointer"));
    pointer.angle = 80;

    // const camera = world.add(new IsometricCamera(0, 0, 0));
    // camera.moveToFocusUVW(50, 50, 0, { duration: 2000 });

    const dragon = world.add(new IsometricAnimatedSprite(95, 95, 50, "dragon"));
    dragon.animate("dragon_walking_back", { duration: 1000 });
    dragon.loop = true;

    for (let i = 9; i > 0; i--) {
        const dragon = world.add(
            new IsometricAnimatedSprite(5 + i * 8, 5 + i * 10, 0, "dragon"),
        );
        dragon.animate("dragon_walking", { duration: 1000 });
        dragon.loop = true;
        dragon.moveToUVW(95, 5 + i * 10, 0, { speed: 0.05 });
        dragon.angle = 270;
    }

    // yield camera.moveToFocusUVW(50, 50, 0, { duration: 1000 });
    // yield camera.moveToFocusUVW(0, 25, 0, { duration: 1000 });
    // yield camera.moveToFocusUVW(50, 0, 0, { duration: 1000 });
})();
