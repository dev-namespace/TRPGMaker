import { RootStore } from "@renderer/store";
import { RenderableEntity, makeId } from "./entity";
import { AnimatedSprite, Sprite, Texture } from "pixi.js";
import { action, autorun, makeObservable, observable, reaction } from "mobx";
import { PerformantPositionable } from "./mixins/position";
import { Scalable } from "./mixins/scale";
import { Renderable } from "./mixins/render";
import { flowRight } from "lodash";
import { IContainer } from "./container";
import { Animable } from "./mixins/animation";

class _AnimatedSprite implements RenderableEntity {
    type = "sprite";
    parent?: IContainer;
    id: string;
    frame: number = 0;
    loop = false;
    playing = false;

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
                    displayObject.texture =
                        spritesheet.animations[this.animation][this.frame];
                } else {
                    displayObject.texture = Texture.EMPTY;
                }
            }),
        ];

        return { disposers, baseDisplayObject: displayObject };
    }

    _update(_rootStore: RootStore, _delta: number) {}
}

// export default Animable(Scalable(PerformantPositionable(Renderable(_AnimatedSprite))));

export default flowRight(
    Animable,
    Scalable,
    PerformantPositionable,
    Renderable,
)(_AnimatedSprite);
