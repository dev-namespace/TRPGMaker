import { Disposer } from "@renderer/store";
import { DisplayObject } from "pixi.js";

export function addReactions(
    { disposers, baseDisplayObject },
    callback: (baseDisplayObject: DisplayObject) => Disposer[],
): { disposers: Disposer[]; baseDisplayObject: DisplayObject } {
    const combinedDisposers = [...disposers, ...callback(baseDisplayObject)];

    return {
        disposers: combinedDisposers,
        baseDisplayObject,
    };
}
