import rootStore from "@renderer/store";
import { EngineEntity, makeEntity } from "./entity";
import { AnimatedSprite, Texture } from "pixi.js";
import { action, autorun, reaction, runInAction } from "mobx";

const { Engine, Assets } = rootStore;

Engine.renderFunctions["sprite"] = renderSprite;

// @TODO consider forcing default animation to avoid quirks of undefined
export interface Sprite extends EngineEntity {
    type: "sprite";
    x: number;
    y: number;
    spritesheet: string;
    animation?: string;
    animationDone: boolean;
    loop: boolean;
    playing: boolean;
    speed: number;
}

function makeSprite(x: number, y: number, spritesheet: string): Sprite {
    return makeEntity({
        x,
        y,
        speed: 0.05,
        spritesheet,
        playing: false,
        animationDone: false,
        loop: false, // @TODO
        type: "sprite",
    }) as Sprite;
}

export function addSprite(x: number, y: number, spritesheet: string): Sprite {
    const sprite = makeSprite(x, y, spritesheet);
    return Engine.add(sprite);
}

async function renderSprite(sprite: Sprite) {
    const displayObject = new AnimatedSprite([Texture.EMPTY]);
    Engine.addDisplayObject(sprite.id, displayObject);
    displayObject.onComplete = action(() => {
        sprite.animationDone = true;
    });
    const spritesheet = await Assets.load(sprite.spritesheet);

    function update() {
        const { x, y, speed, loop } = Engine.entities[sprite.id];
        Object.assign(displayObject, { x, y, animationSpeed: speed, loop });
    }

    function applyAnimationState() {
        const { playing, animation } = Engine.entities[sprite.id];
        if (!animation) return;
        displayObject[playing ? "play" : "stop"]();
    }

    return [
        autorun(update),
        reaction(
            () => Engine.entities[sprite.id].animation,
            (animation) => {
                if (animation) {
                    sprite.animationDone = false;
                    displayObject.textures = spritesheet.animations[animation];
                }
            },
            { fireImmediately: true },
        ),
        autorun(applyAnimationState),
    ];
}
