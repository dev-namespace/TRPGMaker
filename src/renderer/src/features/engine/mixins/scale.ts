import { RootStore } from "@renderer/store";
import { action, autorun, makeObservable, observable } from "mobx";
import { GConstructor } from "./types";
import { addReactions } from "./utils";
import { IRenderable } from "./render";

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

        _render(rootStore: RootStore) {
            return addReactions(
                super._render(rootStore),
                (baseDisplayObject) => [
                    autorun(() => {
                        baseDisplayObject.scale.set(this.scale.x, this.scale.y);
                    }),
                ],
            );
        }

        setScale(x: number, y: number) {
            this.scale.x = x;
            this.scale.y = y;
        }
    };
}
