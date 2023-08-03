import { action, makeObservable, observable, reaction } from "mobx";
import { GConstructor } from "./types";
import { addReactions } from "./utils";

import { Disposer, Reactive, RootStore } from "@renderer/store";
import { DisplayObject } from "@renderer/features/engine";
import { IContainer } from "../container";

export type IRenderable = GConstructor<{
    id: string;
    type: string;
    parent?: IContainer;
    _update(rootStore: RootStore, delta: number): void;
    _render(entity: Reactive<any>): {
        disposers: Disposer[];
        baseDisplayObject: DisplayObject;
    };
}>;

export function Renderable<TBase extends IRenderable>(Base: TBase) {
    return class Renderable extends Base {
        constructor(...args: any[]) {
            super(...args);
            makeObservable(this, {
                parent: observable,
                setParent: action,
            });
        }

        _render(rootStore: RootStore) {
            return addReactions(
                super._render(rootStore),
                (_baseDisplayObject) => [
                    reaction(
                        () => this.parent,
                        () => {
                            rootStore.Engine.appendToParent(this);
                        },
                        { fireImmediately: true },
                    ),
                ],
            );
        }

        setParent(parent: IContainer) {
            this.parent = parent;
        }
    };
}
