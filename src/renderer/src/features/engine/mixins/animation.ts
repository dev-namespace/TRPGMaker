import { RootStore } from "@renderer/store";
import { action, makeObservable, observable, runInAction } from "mobx";
import { GConstructor } from "./types";
import curves from "@renderer/utils/curves";
import { vec2 } from "gl-matrix";
import { IRenderable } from "./render";
import { Assets } from "pixi.js";

export type Speed = number; // frames per second
export type Duration = number;

export type AnimationOptions = {
    source?: number;
    target?: number;
    duration?: number;
    speed?: Speed;
    curve?: keyof typeof curves;
};

export interface Animation {
    source: number;
    target: number;
    elapsed: number;
    duration: number;
    curve: keyof typeof curves;
    callback?: Function;
}

export type IAnimable = GConstructor<{
    spritesheet: string;
    animation: string;
    animationDone: boolean;
    loop: boolean;
    playing: boolean;
    speed: number;
    frame: number;
}>;

export function Animable<TBase extends IAnimable & IRenderable>(Base: TBase) {
    return class extends Base {
        _animations: Animation[] = [];

        constructor(...args: any[]) {
            super(...args);
            makeObservable(this, {
                spritesheet: observable,
                animation: observable,
                animationDone: observable,
                loop: observable,
                playing: observable,
                speed: observable,
                frame: observable,
                setFrame: action,
                setAnimation: action,
                animate: action,
            });
        }

        // Considerably more performant if pos is directly assigned to displayObject
        _update(_rootStore: RootStore, elapsed: number) {
            super._update(_rootStore, elapsed);
            if (this._animations.length === 0) return;

            runInAction(() => {
                const animation = this._animations[0];

                animation.elapsed += elapsed; // @TODO round?

                const mu = curves[animation.curve];
                const frameNumber = Math.floor(
                    mu(animation.elapsed, animation.duration) *
                        (animation.target - animation.source),
                );

                this.frame = animation.source + frameNumber;

                if (animation.elapsed >= animation.duration) {
                    if (this.loop) {
                        animation.elapsed = 0;
                    } else {
                        animation.callback?.();
                        this._animations.shift();
                    }
                }
            });
        }

        setFrame(frame: number) {
            this.frame = frame;
        }

        setAnimation(animation: string) {
            this.animation = animation;
            this.frame = 0;
        }

        animate(
            animation: string,
            { source, target, duration, speed, curve }: AnimationOptions,
        ) {
            return new Promise((resolve) => {
                this.animation = animation;
                const spritesheet = Assets.get(this.spritesheet);
                const length = spritesheet.animations[animation]
                    .length as number;
                source = source || 0;
                target = target || length - 1;

                if (speed) {
                    duration = Math.abs(source - length) / speed;
                }

                if (!duration)
                    throw new Error("duration or speed must be provided");

                this._animations.push({
                    source: source,
                    target: target,
                    elapsed: 0,
                    duration: duration,
                    curve: curve || "linear",
                    callback: resolve,
                });
            });
        }
    };
}
