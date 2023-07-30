import { Disposer, RootStore } from "@renderer/store";
import { v4 as uuid } from "uuid";

export interface RenderableEntity {
    id: string;
    type: string; // @TODO: needed?
    render(rootStore: RootStore): Disposer[];
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
