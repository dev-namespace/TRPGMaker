import rootStore from "@renderer/store";
import { autorun } from "mobx";
import { AnimatedSprite } from "../engine/entities/AnimatedSprite";
import { Isometric } from "./mixins/isometric";
import { World } from "./World";

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

    _render() {
        const { Engine } = rootStore;
        super._render();
        Engine.addReactions(this, [
            autorun(() => {
                this._baseDisplayObject!.zIndex = this.zIndex;
            }),
        ]);
    }
}

export default Isometric(IsometricAnimatedSprite);
