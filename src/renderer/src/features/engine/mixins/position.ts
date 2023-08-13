import rootStore, { RootStore } from "@renderer/store";
import {
    action,
    computed,
    makeObservable,
    observable,
    runInAction,
} from "mobx";
import { GConstructor } from "./types";
import curves from "@renderer/utils/curves";
import { vec2 } from "gl-matrix";
import { IRenderable } from "./render";
import { XY } from "@renderer/utils/coordinates";

export type Speed = number;
export type Duration = number;

export type MovementOptions = {
    duration?: number;
    speed?: Speed;
    curve?: keyof typeof curves;
};

export interface Movement {
    source: vec2;
    target: vec2;
    elapsed: number;
    duration: number;
    curve: keyof typeof curves;
    callback?: Function;
}

export type IPositionable = GConstructor<{}>;

export interface IPositionMixin {
    x: number;
    y: number;
    _movements: Movement[];
    setPosition(x: number, y: number): void;
    moveTo(x: number, y: number, options: MovementOptions): Promise<void>;
}

export function Positionable<TBase extends IPositionable & IRenderable>(
    Base: TBase,
) {
    return class Positionable extends Base implements IPositionMixin {
        _x: number = 0;
        _y: number = 0;
        _movements: Movement[] = [];

        constructor(...args: any[]) {
            super(...args);
            makeObservable(this, {
                _x: observable,
                _y: observable,
                x: computed,
                y: computed,
                setPosition: action,
                moveTo: action,
            });
        }

        _update(elapsedMS: number) {
            super._update(elapsedMS);
            if (this._movements.length === 0) return;

            runInAction(() => {
                const movement = this._movements[0];
                movement.elapsed += elapsedMS; // @TODO round?
                const [x, y] = vec2.lerp(
                    vec2.create(),
                    movement.source,
                    movement.target,
                    curves.linear(
                        Math.min(movement.elapsed, movement.duration),
                        movement.duration,
                    ),
                );

                this.setPosition(x, y);

                if (movement.elapsed >= movement.duration) {
                    movement.callback?.();
                    this._movements.shift();
                }
            });
        }

        get x() {
            return this._x;
        }

        get y() {
            return this._y;
        }

        setPosition(x: number, y: number) {
            this._x = x;
            this._y = y;
        }

        moveTo(x: number, y: number, { duration, speed }: MovementOptions) {
            return new Promise<void>((resolve) => {
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

// This version modifies the displayObject directly
export function PerformantPositionable<
    TBase extends IPositionable & IRenderable,
>(Base: TBase) {
    return class PerformantPositionable extends Base implements IPositionMixin {
        #x: number = 0;
        #y: number = 0;
        _movements: Movement[] = [];
        _newPosition?: XY;
        #initialPosition: XY;

        constructor(...args: any[]) {
            super(...args);
            makeObservable(this, {
                x: computed,
                y: computed,
                setPosition: action,
                moveTo: action,
            });
            this.#initialPosition = { x: args[0], y: args[1] };
        }

        _render() {
            const output = super._render();
            this.setPosition(this.#initialPosition.x, this.#initialPosition.y);
            return output;
        }

        _update(elapsedMS: number) {
            super._update(elapsedMS);

            if (this._newPosition) {
                const { Engine } = rootStore;
                this.#x = this._newPosition.x;
                this.#y = this._newPosition.y;
                const displayObject = Engine.getDisplayObject(this.id);
                displayObject.x = this.#x;
                displayObject.y = this.#y;
            }

            if (this._movements.length > 0) {
                const { Engine } = rootStore;

                const displayObject = Engine.getDisplayObject(this.id);

                runInAction(() => {
                    const movement = this._movements[0];
                    movement.elapsed += elapsedMS;
                    [displayObject.x, displayObject.y] = vec2.lerp(
                        vec2.create(),
                        movement.source,
                        movement.target,
                        curves[movement.curve](
                            Math.min(movement.elapsed, movement.duration),
                            movement.duration,
                        ),
                    );

                    this.#x = displayObject.x;
                    this.#y = displayObject.y;

                    if (movement.elapsed >= movement.duration) {
                        movement.callback?.();
                        this._movements.shift();
                    }
                });
            }
        }

        get x() {
            return this.#x;
        }

        get y() {
            return this.#y;
        }

        setPosition(x: number, y: number) {
            this._baseDisplayObject!.x = x;
            this._baseDisplayObject!.y = y;
            this.#x = x;
            this.#y = y;
        }

        moveTo(
            x: number,
            y: number,
            { duration, speed, curve = "linear" }: MovementOptions,
        ) {
            return new Promise<void>((resolve) => {
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
                    curve: curve,
                    callback: resolve,
                });
            });
        }
    };
}
