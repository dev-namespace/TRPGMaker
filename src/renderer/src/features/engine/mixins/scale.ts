import rootStore from "@renderer/store";
import { action, autorun, makeObservable, observable } from "mobx";
import { IRenderable } from "./render";
import { GConstructor } from "./types";

export type IScalable = GConstructor<{ scale: { x: number; y: number } }>;

export function Scalable<TBase extends IScalable & IRenderable>(Base: TBase) {
    return class Scalable extends Base {
        constructor(...args: any[]) {
            super(...args);
            makeObservable(this, {
                scale: observable,
                setScale: action,
            });
        }

        _render() {
            const { Engine } = rootStore;
            super._render();
            Engine.addReactions(this, [
                autorun(() => {
                    this._baseDisplayObject!.scale.set(
                        this.scale.x,
                        this.scale.y,
                    );
                }),
            ]);
        }

        setScale(x: number, y: number) {
            this.scale.x = x;
            this.scale.y = y;
        }
    };
}
