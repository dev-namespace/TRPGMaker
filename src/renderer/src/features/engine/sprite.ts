import rootStore from "@renderer/store";
import { autorun, makeObservable, observable } from "mobx";
import { Sprite as PIXISprite, Texture } from "pixi.js";
import { BaseRenderableEntity } from "./baseRenderableEntity";
import { PerformantPositionable } from "./mixins/position";
import { Renderable } from "./mixins/render";

class _Sprite extends BaseRenderableEntity {
    type = "sprite";

    constructor(
        _x: number,
        _y: number,
        public texture: string,
        public scale = { x: 1, y: 1 },
    ) {
        super();
        makeObservable(this, {
            texture: observable,
        });
    }

    _render() {
        super._render();
        const { Engine, Assets } = rootStore;
        const displayObject = new PIXISprite(Texture.EMPTY);
        displayObject.texture = Assets.get(this.texture);
        Engine.addDisplayObject(this.id, displayObject);
        Engine.addReactions(this, [
            autorun(() => {
                const anchor = Assets.get(this.texture).defaultAnchor;
                displayObject.pivot.set(anchor.x, anchor.y);
            }),
        ]);
    }
}

export const Sprite = PerformantPositionable(Renderable(_Sprite));
