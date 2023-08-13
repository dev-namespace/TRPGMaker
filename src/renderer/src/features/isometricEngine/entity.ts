import { RenderableEntity } from "../engine/entity";

export interface IsometricEntity extends RenderableEntity {
    _assignWorld(world: any): void;
}
