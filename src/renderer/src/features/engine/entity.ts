import { Disposer, RootStore } from "@renderer/store";
import { v4 as uuid } from "uuid";
import { RenderFunction, UpdateFunction } from ".";
import { IContainer } from "./container";

export interface RenderableEntity {
    id: string;
    type: string; // @TODO: needed?
    parent?: IContainer;
    _render: RenderFunction;
    _update: UpdateFunction;
}

export interface EngineEntity {
    id: string;
    type: string;
}

export function makeId() {
    return uuid();
}

export function makeEntity(properties): EngineEntity {
    return {
        ...properties,
        id: uuid(),
    };
}
