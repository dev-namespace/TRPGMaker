import { RootStore, Reactive, StoreModule } from "@renderer/store";
import { EngineEntity, makeEntity } from "./entity";
import { AnimatedSprite, Texture } from "pixi.js";
import { action, autorun, reaction } from "mobx";

export interface Sprite extends EngineEntity {
    type: "sprite";
    x: number;
    y: number;
    spritesheet: string;
    animation?: string;
    animationDone: boolean;
    loop: boolean;
    playing: boolean;
    speed: number;
}

export class SpriteModule implements StoreModule {
    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.rootStore.Engine.renderFunctions["sprite"] =
            this.render.bind(this);
    }

    private async render(sprite: Reactive<Sprite>) {
        const { Engine, Assets } = this.rootStore;

        const displayObject = new AnimatedSprite([Texture.EMPTY]);
        Engine.addDisplayObject(sprite.id, displayObject);
        displayObject.onComplete = action(() => {
            sprite.animationDone = true;
        });

        const spritesheet = await Assets.load(sprite.spritesheet); // @TODO preload

        function update() {
            const { x, y, speed, loop } = sprite;
            Object.assign(displayObject, { x, y, animationSpeed: speed, loop });
        }

        function applyAnimationState() {
            if (!sprite.animation) return;
            displayObject[sprite.playing ? "play" : "stop"]();
        }

        return [
            autorun(update),
            reaction(
                () => sprite.animation,
                (animation) => {
                    if (animation) {
                        sprite.animationDone = false;
                        displayObject.textures =
                            spritesheet.animations[animation];
                    }
                },
                { fireImmediately: true },
            ),
            autorun(applyAnimationState),
        ];
    }

    add(x: number, y: number, spritesheet: string): Reactive<Sprite> {
        const sprite = this.make(x, y, spritesheet);
        return this.rootStore.Engine.add(sprite);
    }

    make(x: number, y: number, spritesheet: string): Sprite {
        return makeEntity({
            x,
            y,
            speed: 0.05,
            spritesheet,
            playing: false,
            animationDone: false,
            loop: false, // @TODO
            type: "sprite",
        }) as Sprite;
    }
}
