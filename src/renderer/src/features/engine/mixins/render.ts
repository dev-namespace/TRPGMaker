import { action, makeObservable, observable, reaction } from "mobx";
import { GConstructor } from "./types";

import rootStore, { Disposer, Reactive, RootStore } from "@renderer/store";
import { DisplayObject } from "@renderer/features/engine";
import { IContainer } from "../container";

export type IRenderable = GConstructor<{
    id: string;
    type: string;
    parent?: IContainer;
    _baseDisplayObject?: DisplayObject;
    _update(delta: number): void;
    _render(): void;
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

        _render() {
            const { Engine } = rootStore;
            super._render();
            this._baseDisplayObject = Engine.getDisplayObject(this.id);
            Engine.addReactions(this, [
                reaction(
                    () => this.parent,
                    () => {
                        rootStore.Engine.appendToParent(this);
                    },
                    { fireImmediately: true },
                ),
            ]);
        }

        setParent(parent: IContainer) {
            this.parent = parent;
        }
    };
}
