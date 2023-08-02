import { RootStore } from "@renderer/store";
import { action, makeObservable, observable, runInAction } from "mobx";
import { GConstructor, IRenderable } from "./types";
import curves from "@renderer/utils/curves";
import { vec2 } from "gl-matrix";

export type Speed = number;
export type Duration = number;

export type MovementOptions = {
    duration?: number;
    speed?: Speed;
};

export interface Movement {
    source: vec2;
    target: vec2;
    elapsed: number;
    duration: number;
    curve: "linear" | "ease-in" | "ease-out";
    callback?: Function;
}

export type IPositionable = GConstructor<{ x: number; y: number }>;

export function Positionable<TBase extends IPositionable & IRenderable>(
    Base: TBase,
) {
    return class extends Base {
        _movements: Movement[] = [];

        constructor(...args: any[]) {
            super(...args);
            makeObservable(this, {
                x: observable,
                y: observable,
                setPosition: action,
                moveTo: action,
            });
        }

        // Considerably more performant if pos is directly assigned to displayObject
        _update(_rootStore: RootStore, delta: number) {
            super._update(_rootStore, delta);
            if (this._movements.length === 0) return;

            runInAction(() => {
                const movement = this._movements[0];
                movement.elapsed += delta; // @TODO round?
                [this.x, this.y] = vec2.lerp(
                    vec2.create(),
                    movement.source,
                    movement.target,
                    curves.linear(
                        Math.min(movement.elapsed, movement.duration),
                        movement.duration,
                    ),
                );

                if (movement.elapsed >= movement.duration) {
                    movement.callback?.();
                    this._movements.shift();
                }
            });
        }

        setPosition(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        moveTo(x: number, y: number, { duration, speed }: MovementOptions) {
            return new Promise((resolve) => {
                if (speed) {
                    duration =
                        Math.sqrt(
                            Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2),
                        ) / speed;
                }
                if (!duration)
                    throw new Error("duration or speed must be provided");
                this._movements.push({
                    source: vec2.fromValues(this.x, this.y),
                    target: vec2.fromValues(x, y),
                    elapsed: 0,
                    duration: duration,
                    curve: "linear",
                    callback: resolve,
                });
            });
        }
    };
}

// Modifies the displayObject directly
export function PerformantPositionable<
    TBase extends IPositionable & IRenderable,
>(Base: TBase) {
    return class extends Base {
        _movements: Movement[] = [];
        _newPosition?: { x: number; y: number };

        constructor(...args: any[]) {
            super(...args);
        }

        _update(_rootStore: RootStore, delta: number) {
            super._update(_rootStore, delta);

            if (this._newPosition) {
                const { Engine } = _rootStore;
                this.x = this._newPosition.x;
                this.y = this._newPosition.y;
                const displayObject = Engine.getDisplayObject(this.id);
                displayObject.x = this.x;
                displayObject.y = this.y;
            }

            if (this._movements.length > 0) {
                const { Engine } = _rootStore;

                const displayObject = Engine.getDisplayObject(this.id);

                runInAction(() => {
                    const movement = this._movements[0];
                    movement.elapsed += delta; // @TODO round?
                    [displayObject.x, displayObject.y] = vec2.lerp(
                        vec2.create(),
                        movement.source,
                        movement.target,
                        curves.linear(
                            Math.min(movement.elapsed, movement.duration),
                            movement.duration,
                        ),
                    );

                    this.x = displayObject.x;
                    this.y = displayObject.y;

                    if (movement.elapsed >= movement.duration) {
                        movement.callback?.();
                        this._movements.shift();
                    }
                });
            }
        }

        setPosition(x: number, y: number) {
            this._newPosition = { x, y };
        }

        moveTo(x: number, y: number, { duration, speed }: MovementOptions) {
            return new Promise((resolve) => {
                if (speed) {
                    duration =
                        Math.sqrt(
                            Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2),
                        ) / speed;
                }
                if (!duration)
                    throw new Error("duration or speed must be provided");
                this._movements.push({
                    source: vec2.fromValues(this.x, this.y),
                    target: vec2.fromValues(x, y),
                    elapsed: 0,
                    duration: duration,
                    curve: "linear",
                    callback: resolve,
                });
            });
        }
    };
}