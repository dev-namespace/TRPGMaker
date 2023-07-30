import rootStore from "@renderer/store";
import { EngineEntity, makeEntity } from "./entity";
import { Sprite, Texture } from "pixi.js";
import { autorun } from "mobx";

// @TODO move to StoreModule

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
    let displayObject = new Sprite(Texture.EMPTY);
    Engine.addDisplayObject(sprite.id, displayObject);
    displayObject.texture = await Assets.load(sprite.texture);

    function update() {
        const { x, y } = Engine.entities[sprite.id];
        Object.assign(displayObject, { x, y });
    }

    return [autorun(update)];
}
