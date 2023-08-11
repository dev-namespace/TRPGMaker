import { RootStore } from "@renderer/store";
import {
    action,
    computed,
    makeObservable,
    observable,
    runInAction,
} from "mobx";
import { vec2 } from "gl-matrix";
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

export type IIsometric = GConstructor<
    {
        u: number;
        v: number;
        z: number;
        world: InstanceType<typeof World>;
        zIndex: number;
    } & IPositionMixin
>;

export type IIsometricMixin = {
    u: number;
    v: number;
    z: number;
    world: InstanceType<typeof World>;
    UVZ: vec2;
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
            return this.world.xy2uvz(xy(this.x, this.y));
        }

        _update(_rootStore: RootStore, _elaspedMS: number) {
            super._update(_rootStore, _elaspedMS);
            runInAction(() => {
                // @TODO maybe I should update this only when movement is being done?
                this.zIndex = this.world.getZIndex(this.UVZ);
            });
        }

        _assignWorld(world: any) {
            this.world = world;
        }

        setUVZ(u: number, v: number, z: number = 0, scale = { x: 1, y: 1 }) {
            const { x, y } = this.world.uvz2xy(uv(u, v, z));
            this.setPosition(x * scale.x, y * scale.y);
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
            });
        }
    };
}