import { Sprite } from "../engine/entities/Sprite";
import { BaseSprite } from "../engine";
import { World } from "./World";
import { Isometric } from "./mixins/isometric";
import { Directionable } from "./mixins/directionable";
import rootStore from "@renderer/store";
import { reaction } from "mobx";
import * as PIXI from "pixi.js";

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
        public angle = 0,
    ) {
        super(0, 0, texture);
    }

    _render() {
        super._render();
        const { Engine, Assets } = rootStore;
        const displayObject = Engine.getDisplayObject(this.id) as BaseSprite;
        Engine.addReactions(this, [
            reaction(
                () => this.angle,
                async () => {
                    const newTexture = await Assets.load(
                        this.world.textureAngleAdapter(
                            this.angle,
                            this.texture,
                        ),
                    );

                    if (newTexture) displayObject.texture = newTexture;
                },
                { fireImmediately: true },
            ),
        ]);
    }
}

export default Directionable(Isometric(IsometricSprite));
