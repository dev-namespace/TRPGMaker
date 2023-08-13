import { RootStore } from "@renderer/store";
import { DisplayObject } from "../engine";
import { Sprite } from "../engine/entities/Sprite";
import { Isometric } from "./mixins/isometric";
import { World } from "./world";

class IsometricSprite extends Sprite {
    type = "isometric-sprite"; // @TODO: needed? maybe tags with multiple tags like sprite
    zIndex: number = 0;

    // definately initialized by _render
    world!: InstanceType<typeof World>;

    constructor(
        _u: number,
        _v: number,
        _w: number,
        public texture: string,
        public scale = { x: 1, y: 1 },
    ) {
        super(0, 0, texture);
    }

    _render(rootStore: RootStore) {
        const { baseDisplayObject, disposers } = super._render(rootStore);

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
