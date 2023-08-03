import { RootStore } from "@renderer/store";
import { RenderableEntity, makeId } from "./entity";
import { Sprite, Texture } from "pixi.js";
import { makeObservable, observable } from "mobx";
import { PerformantPositionable } from "./mixins/position";
import { Scalable } from "./mixins/scale";
import { IContainer } from "./container";
import { Renderable } from "./mixins/render";

class _Sprite implements RenderableEntity {
    type = "sprite"; // @TODO: needed? maybe tags with multiple tags like sprite
    parent?: IContainer;
    id: string;

    constructor(
        public x: number,
        public y: number,
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

        const displayObject = new Sprite(Texture.EMPTY);
        Engine.addDisplayObject(this.id, displayObject);

        displayObject.texture = Assets.get(this.texture);

        const disposers = [];

        return { disposers, baseDisplayObject: displayObject };
    }

    _update(_rootStore: RootStore, _elapsed: number) {}
}

export default Scalable(PerformantPositionable(Renderable(_Sprite)));
