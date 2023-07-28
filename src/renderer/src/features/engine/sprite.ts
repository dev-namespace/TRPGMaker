import rootStore from "@renderer/store";
import { EngineEntity, makeEntity } from "./entity";
import { AnimatedSprite } from "pixi.js";
import { autorun, reaction, runInAction, when } from "mobx";

const { Engine, Assets } = rootStore;

Engine.renderFunctions["sprite"] = renderSprite;

// @TODO complete interface
// const sprite = makeSprite(0, 0, "dragon");
// renderSprite(sprite);
// const sprite = addSprite(0, 0, "dragon") // make and render shortcut
// animate(sprite, "idle")
// Sprite.setAnimation(sprite, "idle")
// Sprite.play(sprite)
// Sprite.pause(sprite)
// await Sprite.playAnimation(sprite, "attack")

export interface Sprite extends EngineEntity {
    type: "sprite";
    x: number;
    y: number;
    spritesheet: string;
    animation?: string;
    playing: boolean;
    speed: number;
}

// @TODO maybe make this private
export function makeSprite(x: number, y: number, spritesheet: string): Sprite {
    return makeEntity({
        x,
        y,
        speed: 0.05,
        spritesheet,
        animation: null,
        playing: false,
        type: "sprite",
    }) as Sprite;
}

export function addSprite(x: number, y: number, spritesheet: string): Sprite {
    const sprite = makeSprite(x, y, spritesheet);
    return Engine.add(sprite);
}

export async function renderSprite(sprite: Sprite) {
    const spritesheet = await Assets.load(sprite.spritesheet);

    let displayObject = {};

    return [
        autorun(() => {
            console.log("!2 position");
            const { x, y, speed } = Engine.entities[sprite.id];
            Object.assign(displayObject, { x, y, animationSpeed: speed });
        }),
        reaction(
            () => Engine.entities[sprite.id].animation,
            () => {
                const { animation, x, y, speed } = Engine.entities[sprite.id];
                console.log("!2 animation", animation);
                Engine.removeDisplayObject(sprite.id); // @TODO: necessary?
                displayObject = new AnimatedSprite(
                    spritesheet.animations[animation],
                );
                Object.assign(displayObject, { x, y, animationSpeed: speed });
                Engine.addDisplayObject(sprite.id, displayObject);
            },
            { fireImmediately: true },
        ),
        autorun(() => {
            console.log("!2 playing");
            const { playing } = Engine.entities[sprite.id];
            displayObject[playing ? "play" : "stop"]();
        }),
    ];
}

export function updateSprite(sprite, func) {
    runInAction(() => {
        func(Engine.entities[sprite.id]);
    });
}

export function setAnimation(sprite: Sprite, animation: string) {
    Engine.entities[sprite.id].animation = animation;
}
