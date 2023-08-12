import rootStore, { RootStore } from "@renderer/store";
import {
    action,
    computed,
    makeObservable,
    observable,
    runInAction,
} from "mobx";
import { vec2, vec3 } from "gl-matrix";
import curves from "@renderer/utils/curves";
import { uv, xy } from "@renderer/utils/coordinates";
import {
    IPositionMixin,
    IPositionable,
    MovementOptions,
} from "@renderer/features/engine/mixins/position";
import { GConstructor } from "@renderer/features/engine/mixins/types";
import { IRenderable } from "@renderer/features/engine/mixins/render";
import { addReactions } from "@renderer/features/engine/mixins/utils";
import { World } from "../world";
import { Sprite } from "@renderer/features/engine/sprite";

export type IIsometric = GConstructor<
    {
        x: number;
        y: number;
        world: InstanceType<typeof World>;
        zIndex: number;
    } & IPositionMixin
>;

export interface MovementUVW {
    source: vec3;
    target: vec3;
    elapsed: number;
    duration: number;
    curve: keyof typeof curves;
    callback?: Function;
}

export type IIsometricMixin = {
    u: number;
    v: number;
    w: number;
    world: InstanceType<typeof World>;
    UVW: vec2;
    isometricMovements: MovementUVW[];
    setPositionUVW(
        u: number,
        v: number,
        w?: number,
        scale?: { x: number; y: number },
    ): void;
    moveToUVW(
        u: number,
        v: number,
        w: number,
        options: MovementOptions,
        scale?: { x: number; y: number },
    ): Promise<void>;
    _assignWorld(world: InstanceType<typeof World>): void;
};

export function Isometric<
    TBase extends IIsometric & IPositionable & IRenderable,
>(Base: TBase) {
    return class Isometric extends Base {
        #w: number = 0;
        #isometricMovements: MovementUVW[] = [];

        constructor(...args: any[]) {
            super(...args);
            makeObservable(this, {
                zIndex: observable,
                u: computed,
                v: computed,
                w: computed,
                isometricPosition: computed,
                UVW: computed,
                setPositionUVW: action,
            });
        }

        _render(rootStore: RootStore) {
            return addReactions(
                super._render(rootStore),
                (_baseDisplayObject) => [],
            );
        }

        get UVW() {
            return uv(this.u, this.v, this.#w);
        }

        _update(_rootStore: RootStore, elapsedMS: number) {
            super._update(_rootStore, elapsedMS);
            runInAction(() => {
                this.zIndex = this.world.getZIndex(this.isometricPosition);

                if (this.#isometricMovements.length === 0) return;
                const movement = this.#isometricMovements[0];
                movement.elapsed += elapsedMS; // @TODO round?
                const [u, v, w] = vec3.lerp(
                    vec3.create(),
                    movement.source,
                    movement.target,
                    curves.linear(
                        Math.min(movement.elapsed, movement.duration),
                        movement.duration,
                    ),
                );

                this.setPositionUVW(u, v, w);

                if (movement.elapsed >= movement.duration) {
                    movement.callback?.();
                    this.#isometricMovements.shift();
                }
            });
        }

        get u() {
            return this.world.xy2u(xy(this.x, this.y), this.#w);
        }

        get v() {
            return this.world.xy2v(xy(this.x, this.y), this.#w);
        }

        get w() {
            return this.#w;
        }

        get isometricPosition() {
            return { u: this.u, v: this.v, w: this.w };
        }

        _assignWorld(world: any) {
            this.world = world;
        }

        setPositionUVW(
            u: number,
            v: number,
            w: number = 0,
            scale = { x: 1, y: 1 },
        ) {
            const { x, y } = this.world.uvw2xy(uv(u, v, w));
            this.setPosition(x * scale.x, y * scale.y);
            this.#w = w;
        }

        moveToUVW(
            u: number,
            v: number,
            w: number,
            { duration, speed, curve = "linear" }: MovementOptions,
        ) {
            return new Promise((resolve) => {
                const source = this.world.uvw2xy(this.isometricPosition);
                const target = this.world.uvw2xy(uv(u, v, w));
                if (speed) {
                    duration =
                        Math.sqrt(
                            Math.pow(target.x - source.x, 2) +
                                Math.pow(target.y - source.y, 2),
                        ) / speed;
                }
                if (!duration)
                    throw new Error("duration or speed must be provided");

                this.#isometricMovements.push({
                    source: vec3.fromValues(this.u, this.v, this.w),
                    target: vec3.fromValues(u, v, w),
                    elapsed: 0,
                    duration: duration,
                    curve: curve,
                    callback: resolve,
                });
            });
        }
    };
}
