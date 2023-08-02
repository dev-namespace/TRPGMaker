import { Disposer, RootStore } from "@renderer/store";
import { v4 as uuid } from "uuid";
import { RenderFunction } from ".";

export interface RenderableEntity {
    id: string;
    type: string; // @TODO: needed?
    _render: RenderFunction;
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
