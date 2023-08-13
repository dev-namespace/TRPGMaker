import { Disposer, RootStore } from "@renderer/store";
import { RenderableEntity, makeId } from "./entity";
import { Sprite as PIXISprite, Texture } from "pixi.js";
import { autorun, makeObservable, observable } from "mobx";
import { PerformantPositionable } from "./mixins/position";
import { Scalable } from "./mixins/scale";
import { IContainer } from "./container";
import { Renderable } from "./mixins/render";
import { DisplayObject } from ".";
import { XY } from "@renderer/utils/coordinates";

// @TODO: _Sprite extends BasicRenderableEntity?
// - _initialPosition,
// - _update
class _Sprite implements RenderableEntity {
    type = "sprite"; // @TODO: needed? maybe tags with multiple tags like sprite
    parent?: IContainer;
    id: string;

    // definately initialized by _render @TODO: maybe not needed?
    baseDisplayObject!: DisplayObject;

    constructor(
        _x: number,
        _y: number,
        public texture: string,
        public scale = { x: 1, y: 1 },
    ) {
        makeObservable(this, {
            texture: observable,
        });
        this.id = makeId();
    }

    _render(rootStore: RootStore) {
        const { Engine, Assets } = rootStore;

        const displayObject = new PIXISprite(Texture.EMPTY);
        Engine.addDisplayObject(this.id, displayObject);
        displayObject.texture = Assets.get(this.texture);

        const disposers = [
            autorun(() => {
                const anchor = Assets.get(this.texture).defaultAnchor;
                displayObject.pivot.set(anchor.x, anchor.y);
            }),
        ] as Disposer[];

        return { disposers, baseDisplayObject: displayObject as DisplayObject };
    }

    _update(_rootStore: RootStore, _elapsed: number) {}
}

export const Sprite = Scalable(PerformantPositionable(Renderable(_Sprite)));
