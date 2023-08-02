import { RootStore } from "@renderer/store";
import { RenderableEntity, makeId } from "./entity";
import { AnimatedSprite, Texture } from "pixi.js";
import { action, autorun, makeObservable, observable, reaction } from "mobx";
import { Positionable, Scalable } from "./mixins";

export class Sprite implements RenderableEntity {
    type = "sprite";
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
        Engine.addDisplayObject(this.id, displayObject);
        displayObject.onComplete = action(() => {
            this.animationDone = true;
        });

        const spritesheet = Assets.get(this.spritesheet);

        const update = () => {
            const { x, y, speed, loop } = this;
            Object.assign(displayObject, { x, y, animationSpeed: speed, loop });
        };

        const applyAnimationState = () => {
            if (!this.animation) return;
            displayObject[this.playing ? "play" : "stop"]();
        };

        return [
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
    }
}

export default Scalable(Positionable(Sprite));
