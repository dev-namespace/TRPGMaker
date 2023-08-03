import { RootStore } from "@renderer/store";
import { RenderableEntity, makeId } from "./entity";
import { Container } from "pixi.js";
import { makeObservable } from "mobx";
import { PerformantPositionable } from "./mixins/position";
import { Scalable } from "./mixins/scale";
import { Renderable } from "./mixins/render";

// @TODO: I don't like having to create an interface for this... why is not working with _Container?
export type IContainer = { id: string; children: RenderableEntity[] };

class _Container implements RenderableEntity {
    type = "container"; // @TODO: needed?
    parent?: IContainer;
    id: string;
    children: RenderableEntity[] = [];
    rootStore!: RootStore;

    constructor(
        public x: number,
        public y: number,
        public scale = { x: 1, y: 1 },
    ) {
        makeObservable(this, {});
        this.id = makeId();
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

        const displayObject = new Container();
        Engine.addDisplayObject(this.id, displayObject);

        const disposers = [];

        return { disposers, baseDisplayObject: displayObject };
    }

    _update(_rootStore: RootStore, _delta: number) {}
}

export default Scalable(PerformantPositionable(Renderable(_Container)));
