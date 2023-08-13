import { Sprite } from "../engine/entities/Sprite";
import { World } from "./World";
import { Isometric } from "./mixins/isometric";

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
}

export default Isometric(IsometricSprite);
