import { autorun, makeObservable } from "mobx";
import { Disposer, RootStore } from "@renderer/store";
import { IIsometricMixin, Isometric } from "../engine/mixins/isometric";
import World from "@renderer/features/isometricEngine/world";
import { makeId } from "../engine/entity";
import { uv, xy } from "@renderer/utils/coordinates";
import { DisplayObject } from "pixi.js";
import { MovementOptions } from "../engine/mixins/position";
import { Camera } from "../engine/camera";

class _IsometricCamera extends Camera {
    type = "camera";
    id: string;
    width: number = 0;
    height: number = 0;
    declare moveToUVZ: IIsometricMixin["moveToUVZ"];
    declare setUVZ: IIsometricMixin["setUVZ"];

    // definately initialized by _render
    world!: InstanceType<typeof World>;

    constructor(
        public u: number,
        public v: number,
        public z: number,
    ) {
        super(0, 0);
        makeObservable(this, {});
        this.id = makeId();
    }

    focusUVZ(u: number, v: number, z: number) {
        const { x, y } = this.world.uvz2xy(uv(u, v, z));
        const correctedX = x * this.world.scale.x - this.width / 2;
        const correctedY = y * this.world.scale.y - this.height / 2;
        const {
            u: correctedU,
            v: correctedV,
            z: correctedZ,
        } = this.world.xy2uvz(xy(correctedX, correctedY));
        this.setUVZ(correctedU, correctedV, correctedZ);
    }

    moveToFocusUVZ(u: number, v: number, z: number, options: MovementOptions) {
        const { x, y } = this.world.uvz2xy(uv(u, v, z));
        const correctedX = x * this.world.scale.x - this.width / 2;
        const correctedY = y * this.world.scale.y - this.height / 2;
        const {
            u: correctedU,
            v: correctedV,
            z: correctedZ,
        } = this.world.xy2uvz(xy(correctedX, correctedY));
        return this.moveToUVZ(correctedU, correctedV, correctedZ, options);
    }

    _render(rootStore: RootStore) {
        const { baseDisplayObject, disposers } = super._render(rootStore);
        const { Engine } = rootStore;

        const composedDisposers = [
            ...disposers,
            autorun(() => {
                Engine.stage!.position.set(-this.x, -this.y);
            }),
        ] as Disposer[];
        return {
            disposers: composedDisposers,
            baseDisplayObject: baseDisplayObject as DisplayObject,
        };
    }
}

export const IsometricCamera = Isometric(_IsometricCamera);
