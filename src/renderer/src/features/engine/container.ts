import { RootStore } from "@renderer/store";
import { RenderableEntity, makeId } from "./entity";
import { Container as PIXIContainer } from "pixi.js";
import { makeObservable } from "mobx";
import { PerformantPositionable } from "./mixins/position";
import { Scalable } from "./mixins/scale";
import { Renderable } from "./mixins/render";
import { XY } from "@renderer/utils/coordinates";

// @TODO: I don't like having to create an interface for this... why is not working with _Container?
export type IContainer = RenderableEntity & {
    children: RenderableEntity[];
};

class _Container implements RenderableEntity, IContainer {
    type = "container"; // @TODO: needed?
    parent?: IContainer;
    children: RenderableEntity[] = [];
    id: string;
    _initialPosition: XY;

    // definately initialized by _render
    rootStore!: RootStore;
    baseDisplayObject!: PIXIContainer;

    constructor(
        x: number,
        y: number,
        public scale = { x: 1, y: 1 },
    ) {
        makeObservable(this, {});
        this.id = makeId();
        this._initialPosition = { x, y };
    }

    add(input: RenderableEntity | RenderableEntity[]) {
        if (Array.isArray(input)) {
            input.forEach((entity) => {
                this._add(entity);
            });
        } else {
            this._add(input);
        }
    }

    _add(entity: RenderableEntity) {
        this.children.push(entity);
        entity.parent = this;
    }

    _render(rootStore: RootStore) {
        this.rootStore = rootStore;
        const { Engine } = rootStore;

        const displayObject = new PIXIContainer();
        displayObject.sortableChildren = true;
        Engine.addDisplayObject(this.id, displayObject);
        displayObject.position.set(
            this._initialPosition.x,
            this._initialPosition.y,
        );

        const disposers = [];

        return { disposers, baseDisplayObject: displayObject };
    }

    _update(_rootStore: RootStore, _elapsedMS: number) {}
}

export const Container = Scalable(
    PerformantPositionable(Renderable(_Container)),
);
