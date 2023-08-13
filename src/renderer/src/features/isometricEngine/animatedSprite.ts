import { Disposer, RootStore } from "@renderer/store";
import { UVW } from "@renderer/utils/coordinates";
import { autorun } from "mobx";
import { DisplayObject } from "../engine";
import { AnimatedSprite } from "../engine/entities/AnimatedSprite";
import { IIsometricMixin, Isometric } from "./mixins/isometric";
import { World } from "./world";

class IsometricAnimatedSprite extends AnimatedSprite {
    type = "isometric-sprite"; // @TODO: needed? maybe tags with multiple tags like sprite
    zIndex: number = 0;

    // definately initialized by _render
    world!: InstanceType<typeof World>;

    constructor(
        _u: number,
        _v: number,
        _w: number,
        public spritesheet: string,
        public scale = { x: 1, y: 1 },
    ) {
        super(0, 0, spritesheet);
    }

    _render(rootStore: RootStore) {
        const { baseDisplayObject, disposers } = super._render(rootStore);

        const composedDisposers = [
            ...disposers,
            autorun(() => {
                baseDisplayObject.zIndex = this.zIndex;
            }),
        ] as Disposer[];

        return {
            disposers: composedDisposers,
            baseDisplayObject: baseDisplayObject as DisplayObject,
        };
    }

    _update(_rootStore: RootStore, _elapsed: number) {
        return super._update(_rootStore, _elapsed);
    }
}

export default Isometric(IsometricAnimatedSprite);
