import rootStore from "@renderer/store";
import { EngineEntity, makeEntity } from "./entity";
import { AnimatedSprite } from "pixi.js";
import { autorun, reaction } from "mobx";

const { Engine, Assets } = rootStore;

Engine.renderFunctions["sprite"] = renderSprite;

export interface Sprite extends EngineEntity {
    type: "sprite";
    x: number;
    y: number;
    spritesheet: string;
    animation?: string;
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

    function update() {
        const { x, y, speed } = Engine.entities[sprite.id];
        Object.assign(displayObject, { x, y, animationSpeed: speed });
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
            () => {
                const { animation } = Engine.entities[sprite.id];
                if (!animation) return;
                Engine.removeDisplayObject(sprite.id);
                displayObject = new AnimatedSprite(
                    spritesheet.animations[animation],
                );
                console.log("!2 displayObject", displayObject);
                update();
                Engine.addDisplayObject(sprite.id, displayObject);
            },
            { fireImmediately: true },
        ),
        autorun(applyAnimationState),
    ];
}
