import { v4 as uuid } from "uuid";

export interface EngineEntity {
    id: string;
    type: string;
}

export function makeEntity(properties): EngineEntity {
    return {
        ...properties,
        id: uuid(),
    };
}
