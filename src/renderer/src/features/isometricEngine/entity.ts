import { Disposer, Reactive } from "@renderer/store";
import { RenderableEntity } from "../engine/entity";
import { DisplayObject } from "pixi.js";

export type IsometricRenderFunction = (
    entity: Reactive<any>,
    world: any,
) => {
    disposers: Disposer[];
    baseDisplayObject: DisplayObject;
};

export interface IsometricEntity extends RenderableEntity {
    _assignWorld(world: any): void;
}
