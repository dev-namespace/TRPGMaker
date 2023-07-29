import rootStore from "@renderer/store";
import { EngineEntity, makeEntity } from "./entity";
import { Sprite } from "pixi.js";
import { autorun } from "mobx";

const { Engine, Assets } = rootStore;

Engine.renderFunctions["static-sprite"] = renderStaticSprite;

export interface StaticSprite extends EngineEntity {
    type: "static-sprite";
    x: number;
    y: number;
    texture: string;
}

function makeStaticSprite(x: number, y: number, texture: string): StaticSprite {
    return makeEntity({
        x,
        y,
        texture,
        type: "static-sprite",
    }) as StaticSprite;
}

export function addStaticSprite(
    x: number,
    y: number,
    texture: string,
): StaticSprite {
    const sprite = makeStaticSprite(x, y, texture);
    return Engine.add(sprite);
}

export async function renderStaticSprite(sprite: StaticSprite) {
    const texture = await Assets.load(sprite.texture);

    console.log("!2 rendering static");
    let displayObject = new Sprite(texture);
    Engine.addDisplayObject(sprite.id, displayObject);

    function update() {
        const { x, y } = Engine.entities[sprite.id];
        Object.assign(displayObject, { x, y });
    }

    return [autorun(update)];
}
