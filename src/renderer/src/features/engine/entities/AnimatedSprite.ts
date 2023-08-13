import { autorun } from "mobx";
import { Sprite, Texture } from "pixi.js";

import { Animable } from "@renderer/features/engine/mixins/animation";
import { PerformantPositionable } from "@renderer/features/engine/mixins/position";
import { Renderable } from "@renderer/features/engine/mixins/render";
import { Scalable } from "@renderer/features/engine/mixins/scale";
import rootStore from "@renderer/store";
import { BaseRenderableEntity } from "./BaseRenderableEntity";

class _AnimatedSprite extends BaseRenderableEntity {
    type = "animated-sprite";
    frame: number = 0;
    loop = false;
    playing = false;

    constructor(
        _x: number,
        _y: number,
        public spritesheet: string,
        public animation?: string,
        public speed = 0.05,
        public scale = { x: 1, y: 1 },
    ) {
        super();
    }

    _render() {
        super._render();
        const { Engine, Assets } = rootStore;
        const displayObject = new Sprite(Texture.EMPTY);
        const spritesheet = Assets.get(this.spritesheet);
        Engine.addDisplayObject(this.id, displayObject);
        Engine.addReactions(this, [
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
        ]);
    }
}

export const AnimatedSprite = Animable(
    Scalable(PerformantPositionable(Renderable(_AnimatedSprite))),
);
