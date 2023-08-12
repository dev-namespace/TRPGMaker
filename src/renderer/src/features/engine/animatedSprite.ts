import { Disposer, RootStore } from "@renderer/store";
import { RenderableEntity, makeId } from "./entity";
import { Sprite, Texture } from "pixi.js";
import { autorun, makeObservable } from "mobx";
import { PerformantPositionable } from "./mixins/position";
import { Scalable } from "./mixins/scale";
import { Renderable } from "./mixins/render";
import { IContainer } from "./container";
import { Animable } from "./mixins/animation";
import { DisplayObject } from ".";

class _AnimatedSprite implements RenderableEntity {
    type = "sprite";
    parent?: IContainer;
    id: string;
    frame: number = 0;
    loop = false;
    playing = false;

    // definately initialized by _render
    baseDisplayObject!: DisplayObject;

    // @TODO: fix x, y are not being taken into account
    constructor(
        public x: number,
        public y: number,
        public spritesheet: string,
        public animation?: string,
        public speed = 0.05,
        public scale = { x: 1, y: 1 },
    ) {
        makeObservable(this, {});
        this.id = makeId();
    }

    _render(rootStore: RootStore) {
        const { Engine, Assets } = rootStore;

        const displayObject = new Sprite(Texture.EMPTY);
        Engine.addDisplayObject(this.id, displayObject);

        const spritesheet = Assets.get(this.spritesheet);

        const disposers = [
            autorun(() => {
                if (this.animation) {
                    const anchor =
                        spritesheet.animations[this.animation][this.frame]
                            .defaultAnchor;
                    displayObject.pivot.set(anchor.x, anchor.y);
                    displayObject.texture =
                        spritesheet.animations[this.animation][this.frame];
                } else {
                    displayObject.texture = Texture.EMPTY;
                }
            }),
        ] as Disposer[];

        return { disposers, baseDisplayObject: displayObject as DisplayObject };
    }

    _update(_rootStore: RootStore, _delta: number) {}
}

export const AnimatedSprite = Animable(
    Scalable(PerformantPositionable(Renderable(_AnimatedSprite))),
);
