import { Disposer, RootStore } from "@renderer/store";
import { AnimatedSprite, DisplayObject } from "../engine";
import { Isometric } from "../engine/mixins/isometric";
import World from "./world";
import { uv, xy } from "@renderer/utils/coordinates";

class IsometricAnimatedSprite extends AnimatedSprite {
    type = "isometric-sprite"; // @TODO: needed? maybe tags with multiple tags like sprite
    x: number = 0;
    y: number = 0;
    _initial_position: { u: number; v: number; z: number } = {
        u: 0,
        v: 0,
        z: 0,
    };

    // definately initialized by _render
    world!: InstanceType<typeof World>;

    constructor(
        public u: number,
        public v: number,
        public z: number,
        public spritesheet: string,
        public scale = { x: 1, y: 1 },
    ) {
        super(0, 0, spritesheet);
        this._initial_position = { u, v, z };
    }

    _render(rootStore: RootStore) {
        const { baseDisplayObject, disposers } = super._render(rootStore);

        let { x, y } = this.world.uvz2xy(this._initial_position);
        this.setPosition(x, y);

        const composedDisposers = disposers as Disposer[];

        return {
            disposers: composedDisposers,
            baseDisplayObject: baseDisplayObject as DisplayObject,
        };
    }

    get UVZ() {
        console.log("!2 getting UVZ");
        return this.world.xy2uvz(xy(this.x, this.y));
    }

    setUVZ(u: number, v: number, z: number = 0) {
        console.log("!2 setting UVZ");
        const { x, y } = this.world.uvz2xy(uv(u, v, z));
        // @ts-ignore @TODO: fix
        this.setPosition(x, y);
    }

    _update(_rootStore: RootStore, _elapsed: number) {
        return super._update(_rootStore, _elapsed);
    }
}

export default Isometric(IsometricAnimatedSprite);
