import { DisplayObject } from "@renderer/features/engine";
import { RenderableEntity, makeId } from "@renderer/features/engine/entity";
import { IContainer } from "./Container";

export class BaseRenderableEntity implements RenderableEntity {
    type = "basic";
    parent?: IContainer;
    id: string;

    // definately initialized by _render
    baseDisplayObject!: DisplayObject;

    constructor() {
        if (this.constructor == BaseRenderableEntity) {
            throw new Error(
                "Trying to instantiate abstract class: BaseRenderableEntity",
            );
        }
        this.id = makeId();
    }

    _render() {}
    _update(_elapsed: number) {}
}
