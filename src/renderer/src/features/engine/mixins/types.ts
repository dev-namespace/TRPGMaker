import { Disposer, Reactive, RootStore } from "@renderer/store";
import { DisplayObject } from "pixi.js";

export type Constructor = new (...args: any[]) => {};
export type GConstructor<T = {}> = new (...args: any[]) => T;
export type IRenderable = GConstructor<{
    id: string;
    _update(rootStore: RootStore, delta: number): void;
    _render(entity: Reactive<any>): {
        disposers: Disposer[];
        baseDisplayObject: DisplayObject;
    };
}>;
