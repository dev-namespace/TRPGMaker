import { RenderableEntity } from "@renderer/features/engine/entity";
import { PerformantPositionable } from "@renderer/features/engine/mixins/position";
import { Renderable } from "@renderer/features/engine/mixins/render";
import { Scalable } from "@renderer/features/engine/mixins/scale";
import rootStore from "@renderer/store";
import { Container as PIXIContainer } from "pixi.js";
import { BaseRenderableEntity } from "./BaseRenderableEntity";

export type IContainer = RenderableEntity & {
    children: RenderableEntity[];
};

class _Container extends BaseRenderableEntity {
    type = "container";
    children: RenderableEntity[] = [];

    constructor(
        _x: number,
        _y: number,
        public scale = { x: 1, y: 1 },
    ) {
        super();
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

    _render() {
        super._render();
        const { Engine } = rootStore;
        const displayObject = new PIXIContainer();
        displayObject.sortableChildren = true;
        Engine.addDisplayObject(this.id, displayObject);
    }
}

// export const Sprite = PerformantPositionable(Renderable(_Sprite));

// import { Disposer, RootStore } from "@renderer/store";
// import { RenderableEntity, makeId } from "./entity";
// import { Container as PIXIContainer } from "pixi.js";
// import { makeObservable } from "mobx";
// import { PerformantPositionable } from "./mixins/position";
// import { Scalable } from "./mixins/scale";
// import { Renderable } from "./mixins/render";
// import { DisplayObject } from ".";

// // @TODO: I don't like having to create an interface for this... why is not working with _Container?
// export type IContainer = RenderableEntity & {
//     children: RenderableEntity[];
// };

// class _Container implements RenderableEntity, IContainer {
//     type = "container"; // @TODO: needed?
//     parent?: IContainer;
//     children: RenderableEntity[] = [];
//     id: string;

//     // definately initialized by _render
//     rootStore!: RootStore;
//     baseDisplayObject!: PIXIContainer;

//     constructor(
//         _x: number,
//         _y: number,
//         public scale = { x: 1, y: 1 },
//     ) {
//         makeObservable(this, {});
//         this.id = makeId();
//     }

//     add(input: RenderableEntity | RenderableEntity[]) {
//         if (Array.isArray(input)) {
//             input.forEach((entity) => {
//                 this._add(entity);
//             });
//         } else {
//             this._add(input);
//         }
//     }

//     _add(entity: RenderableEntity) {
//         this.children.push(entity);
//         entity.parent = this;
//     }

//     _render(rootStore: RootStore) {
//         this.rootStore = rootStore;
//         const { Engine } = rootStore;

//         const displayObject = new PIXIContainer();
//         displayObject.sortableChildren = true;

//         Engine.addDisplayObject(this.id, displayObject);

//         const disposers = [] as Disposer[];

//         return { disposers, baseDisplayObject: displayObject as DisplayObject };
//     }

//     _update(_rootStore: RootStore, _elapsedMS: number) {}
// }

export const Container = Scalable(
    PerformantPositionable(Renderable(_Container)),
);
