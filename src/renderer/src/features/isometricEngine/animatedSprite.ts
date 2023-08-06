import { Disposer, RootStore } from "@renderer/store";
import { AnimatedSprite, DisplayObject } from "../engine";
import { Isometric } from "../engine/mixins/isometric";
import World from "./world";

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
        public texture: string,
        public scale = { x: 1, y: 1 },
    ) {
        super(0, 0, texture);
        this._initial_position = { u, v, z };
    }

    _render(rootStore: RootStore) {
        const { baseDisplayObject, disposers } = super._render(rootStore);

        // @TODO: hack + shouldn't read from PIXI.texture
        const spritesheet = rootStore.Assets.get(this.spritesheet);
        const texture = Object.values(spritesheet.textures)[0];
        console.log("!2 spritesheet", spritesheet);
        console.log("!2 texture", texture);

        let { x, y } = this.world.uvz2xy(this._initial_position);

        x -= texture.width / 2;
        y -= texture.height - 10;

        this.setPosition(x, y);

        const composedDisposers = disposers as Disposer[];

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
