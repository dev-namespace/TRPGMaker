import { RootStore } from "@renderer/store";
import { RenderableEntity, makeId } from "./entity";
import { AnimatedSprite, Texture } from "pixi.js";
import { action, autorun, makeObservable, observable, reaction } from "mobx";
import { PerformantPositionable } from "./mixins/position";
import { Scalable } from "./mixins/scale";
import { Renderable } from "./mixins/render";
import { flowRight } from "lodash";
import { IContainer } from "./container";

class _AnimatedSprite implements RenderableEntity {
    type = "sprite";
    parent?: IContainer;
    id: string;

    constructor(
        public x: number,
        public y: number,
        public spritesheet: string,
        public animation?: string,
        public animationDone = false,
        public loop = false,
        public playing = false,
        public speed = 0.05,
        public scale = { x: 1, y: 1 },
    ) {
        makeObservable(this, {
            spritesheet: observable,
            animation: observable,
            animationDone: observable,
            loop: observable,
            playing: observable,
            speed: observable,
        });
        this.id = makeId();
    }

    _render(rootStore: RootStore) {
        const { Engine, Assets } = rootStore;

        const displayObject = new AnimatedSprite([Texture.EMPTY]);
        // Engine.addDisplayObject(this.id, displayObject);
        Engine.addDisplayObject(this.id, displayObject);
        displayObject.onComplete = action(() => {
            this.animationDone = true;
        });

        const spritesheet = Assets.get(this.spritesheet);

        const update = () => {
            const { speed, loop } = this;
            Object.assign(displayObject, { animationSpeed: speed, loop });
        };

        const applyAnimationState = () => {
            if (!this.animation) return;
            displayObject[this.playing ? "play" : "stop"]();
        };

        const disposers = [
            autorun(update),
            reaction(
                () => this.animation,
                (animation) => {
                    if (animation) {
                        this.animationDone = false;
                        displayObject.textures =
                            spritesheet.animations[animation];
                    }
                },
                { fireImmediately: true },
            ),
            autorun(applyAnimationState),
        ];

        return { disposers, baseDisplayObject: displayObject };
    }

    _update(_rootStore: RootStore, _delta: number) {}
}

export default flowRight(
    Scalable,
    PerformantPositionable,
    Renderable,
)(_AnimatedSprite);
