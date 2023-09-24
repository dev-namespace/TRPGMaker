import { IRenderable } from "@renderer/features/engine/mixins/render";
import { IScalable } from "@renderer/features/engine/mixins/scale";
import { GConstructor } from "@renderer/features/engine/mixins/types";
import rootStore from "@renderer/store";
import { action, makeObservable, observable, reaction } from "mobx";
import { IIsometric } from "./isometric";
import { BaseSprite } from "@renderer/features/engine";

export type IDirectionable = GConstructor<{ angle: number }>;

export function Directionable<
    TBase extends IRenderable & IDirectionable & IScalable & IIsometric,
>(Base: TBase) {
    return class Directionable extends Base {
        constructor(...args: any[]) {
            super(...args);
            makeObservable(this, {
                angle: observable,
                setAngle: action,
            });
        }

        _render() {
            const { Engine } = rootStore;
            super._render();
            const displayObject = Engine.getDisplayObject(
                this.id,
            ) as BaseSprite;
            Engine.addReactions(this, [
                reaction(
                    () => this.angle,
                    () => {
                        if (this.world.angleRequiresFlip(this.angle)) {
                            displayObject.scale.x =
                                Math.abs(displayObject.scale.x) * -1;
                        }
                    },
                    { fireImmediately: true },
                ),
            ]);
        }

        setAngle(degrees: number) {
            this.angle = degrees;
        }
    };
}
