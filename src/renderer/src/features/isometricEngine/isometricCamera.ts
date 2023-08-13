import { autorun, makeObservable } from "mobx";
import { Disposer, RootStore } from "@renderer/store";
import { makeId } from "../engine/entity";
import { UVW, uv, xy } from "@renderer/utils/coordinates";
import { DisplayObject } from "pixi.js";
import { MovementOptions } from "../engine/mixins/position";
import { Camera } from "../engine/camera";
import { IIsometricMixin, Isometric } from "./mixins/isometric";
import { World } from "./world";

class _IsometricCamera extends Camera {
    type = "camera";
    id: string;
    width: number = 0;
    height: number = 0;
    zIndex: number = 0;

    declare moveToUVW: IIsometricMixin["moveToUVW"];
    declare setPositionUVW: IIsometricMixin["setPositionUVW"];

    // definately initialized by _render
    world!: InstanceType<typeof World>;

    constructor(_u: number, _v: number, _w: number) {
        super(0, 0);
        this.id = makeId();
    }

    focusUVW(u: number, v: number, w: number) {
        const { x, y } = this.world.uvw2xy(uv(u, v, w));
        const correctedX =
            x * this.world.scale.x - this.width / 2 + this.world.x;
        const correctedY =
            y * this.world.scale.y - this.height / 2 + this.world.y;
        const {
            u: correctedU,
            v: correctedV,
            w: correctedZ,
        } = this.world.xy2uvw(xy(correctedX, correctedY), w);
        this.setPositionUVW(correctedU, correctedV, correctedZ);
    }

    moveToFocusUVW(u: number, v: number, w: number, options: MovementOptions) {
        const { x, y } = this.world.uvw2xy(uv(u, v, w));
        const correctedX = x * this.world.scale.x - this.width / 2;
        const correctedY = y * this.world.scale.y - this.height / 2;
        const {
            u: correctedU,
            v: correctedV,
            w: correctedZ,
        } = this.world.xy2uvw(xy(correctedX, correctedY), w);
        return this.moveToUVW(correctedU, correctedV, correctedZ, options);
    }

    _render(rootStore: RootStore) {
        const { baseDisplayObject, disposers } = super._render(rootStore);

        const composedDisposers = [...disposers] as Disposer[];
        return {
            disposers: composedDisposers,
            baseDisplayObject: baseDisplayObject as DisplayObject,
        };
    }
}

export const IsometricCamera = Isometric(_IsometricCamera);
