import { RootStore } from "@renderer/store";
import { DisplayObject } from "../engine";
import { Sprite } from "../engine/sprite";
import { IIsometricMixin, Isometric } from "./mixins/isometric";
import { World } from "./world";
import { UVW } from "@renderer/utils/coordinates";

class IsometricSprite extends Sprite {
    type = "isometric-sprite"; // @TODO: needed? maybe tags with multiple tags like sprite
    x: number = 0;
    y: number = 0;
    zIndex: number = 0;
    _initial_position: UVW = {
        u: 0,
        v: 0,
        w: 0,
    };

    // definately initialized by _render
    world!: InstanceType<typeof World>;

    // Mixin types
    declare setPositionUVW: IIsometricMixin["setPositionUVW"];

    constructor(
        u: number,
        v: number,
        w: number,
        public texture: string,
        public scale = { x: 1, y: 1 },
    ) {
        super(0, 0, texture);
        this._initial_position = { u, v, w };
    }

    _render(rootStore: RootStore) {
        const { baseDisplayObject, disposers } = super._render(rootStore);

        this.setPositionUVW(
            this._initial_position.u,
            this._initial_position.v,
            this._initial_position.w,
        );

        const composedDisposers = disposers;

        return {
            disposers: composedDisposers,
            baseDisplayObject: baseDisplayObject as DisplayObject,
        };
    }

    _update(_rootStore: RootStore, _elapsed: number) {
        return super._update(_rootStore, _elapsed);
    }
}

export default Isometric(IsometricSprite);
