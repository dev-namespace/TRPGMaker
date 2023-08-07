import { v4 as uuid } from "uuid";
import { RenderFunction, UpdateFunction } from ".";
import { IContainer } from "./container";

export interface Entity {
    id: string;
    type: string; // @TODO: needed?
}

export interface UpdatableEntity extends Entity {
    _update: UpdateFunction;
    _render: RenderFunction;
}

export interface RenderableEntity extends UpdatableEntity {
    parent?: IContainer;
}

export interface EngineEntity {
    id: string;
    type: string;
}

export function makeId() {
    return uuid();
}
