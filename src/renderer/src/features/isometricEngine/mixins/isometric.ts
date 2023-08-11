import { RootStore } from "@renderer/store";
import {
    action,
    computed,
    makeObservable,
    observable,
    runInAction,
} from "mobx";
import { vec2, vec3 } from "gl-matrix";
import curves from "@renderer/utils/curves";
import { uv } from "@renderer/utils/coordinates";
import {
    IPositionMixin,
    IPositionable,
    MovementOptions,
} from "@renderer/features/engine/mixins/position";
import { GConstructor } from "@renderer/features/engine/mixins/types";
import { IRenderable } from "@renderer/features/engine/mixins/render";
import { addReactions } from "@renderer/features/engine/mixins/utils";
import { World } from "../world";

export type IIsometric = GConstructor<
    {
        u: number;
        v: number;
        z: number;
        world: InstanceType<typeof World>;
        zIndex: number;
    } & IPositionMixin
>;

export interface MovementUVZ {
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
    z: number;
    world: InstanceType<typeof World>;
    UVZ: vec2;
    _movementsUVZ: MovementUVZ[];
    setUVZ(
        u: number,
        v: number,
        z?: number,
        scale?: { x: number; y: number },
    ): void;
    moveToUVZ(
        u: number,
        v: number,
        z: number,
        options: MovementOptions,
        scale?: { x: number; y: number },
    ): Promise<void>;
    _assignWorld(world: InstanceType<typeof World>): void;
};

export function Isometric<
    TBase extends IIsometric & IPositionable & IRenderable,
>(Base: TBase) {
    return class Isometric extends Base {
        _movementsUVZ: MovementUVZ[] = [];

        constructor(...args: any[]) {
            super(...args);
            makeObservable(this, {
                zIndex: observable,
                UVZ: computed,
                setUVZ: action,
            });
        }

        _render(rootStore: RootStore) {
            return addReactions(
                super._render(rootStore),
                (_baseDisplayObject) => [],
            );
        }

        get UVZ() {
            return uv(this.u, this.v, this.z);
        }

        _update(_rootStore: RootStore, elapsedMS: number) {
            super._update(_rootStore, elapsedMS);
            runInAction(() => {
                this.zIndex = this.world.getZIndex(this.UVZ);

                if (this._movementsUVZ.length === 0) return;
                const movement = this._movementsUVZ[0];
                movement.elapsed += elapsedMS; // @TODO round?
                [this.u, this.v, this.z] = vec3.lerp(
                    vec3.create(),
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

        _assignWorld(world: any) {
            this.world = world;
        }

        setUVZ(u: number, v: number, z: number = 0, scale = { x: 1, y: 1 }) {
            const { x, y } = this.world.uvz2xy(uv(u, v, z));
            this.setPosition(x * scale.x, y * scale.y);
            this.u = u;
            this.v = v;
            this.z = z;
        }

        moveToUVZ(
            u: number,
            v: number,
            z: number,
            { duration, speed, curve = "linear" }: MovementOptions,
        ) {
            return new Promise((resolve) => {
                const source = this.world.uvz2xy(this.UVZ);
                const target = this.world.uvz2xy(uv(u, v, z));
                if (speed) {
                    duration =
                        Math.sqrt(
                            Math.pow(target.x - source.x, 2) +
                                Math.pow(target.y - source.y, 2),
                        ) / speed;
                }
                if (!duration)
                    throw new Error("duration or speed must be provided");
                this._movements.push({
                    source: vec2.fromValues(source.x, source.y),
                    target: vec2.fromValues(target.x, target.y),
                    elapsed: 0,
                    duration: duration,
                    curve: curve,
                    callback: resolve,
                });

                this._movementsUVZ.push({
                    source: vec3.fromValues(this.UVZ.u, this.UVZ.v, this.UVZ.z),
                    target: vec3.fromValues(u, v, z),
                    elapsed: 0,
                    duration: duration,
                    curve: curve,
                    callback: resolve,
                });
            });
        }
    };
}
