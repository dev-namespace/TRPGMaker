import { Container, DisplayObject } from "@renderer/features/engine";
import * as PIXI from "pixi.js";
import { drawRect } from "../engine/graphics";
import { Reactive, RootStore } from "@renderer/store";
import { IContainer } from "../engine/container";
import { RenderableEntity, makeId } from "../engine/entity";
import { Renderable } from "../engine/mixins/render";
import { PerformantPositionable } from "../engine/mixins/position";
import { Scalable } from "../engine/mixins/scale";
import { IsometricEntity } from "./entity";

// @TODO World -> IsometricSpace

export type IIsometricSpace = IContainer & {};

class World implements IIsometricSpace {
    type = "world";
    parent?: IContainer;
    children: RenderableEntity[] = [];
    id: string;

    // definately initialized by _render
    baseDisplayObject!: DisplayObject;
    container!: IContainer;
    rootStore!: RootStore;

    constructor(
        public x: number,
        public y: number,
        public uWidth: number,
        public vWidth: number,
        public uvzRatio: number,
        public scale = { x: 1, y: 1 },
    ) {
        this.id = makeId();
    }

    center({ x, y }: { x: number; y: number }) {
        return {
            x: x + this.width / 2,
            y: y + this.height / 2,
        };
    }

    uvz2xy({ u, v }: { u: number; v: number }) {
        const centerOffsetX = this.uWidth * this.uvzRatio;
        const x = u * this.uvzRatio - v * this.uvzRatio + centerOffsetX;
        const y = u + v;
        return { x, y };
    }

    xy2uvz({ x, y }: { x: number; y: number }) {
        const centerOffsetX = this.uWidth * this.uvzRatio;
        const u = (x + y * this.uvzRatio - centerOffsetX) / (2 * this.uvzRatio);
        const v =
            y - (x + y * this.uvzRatio - centerOffsetX) / (2 * this.uvzRatio);
        return { u, v };
    }

    get width() {
        return this.uvz2xy({ u: this.uWidth, v: 0 }).x;
    }

    get height() {
        return this.uvz2xy({ u: this.uWidth, v: this.vWidth }).y;
    }

    // add(input: RenderableEntity | RenderableEntity[]) {
    //     if (Array.isArray(input)) {
    //         input.forEach((entity) => {
    //             this._add(entity);
    //         });
    //     } else {
    //         this._add(input);
    //     }
    // }

    // _add(entity: RenderableEntity) {
    //     this.children.push(entity);
    //     entity.parent = this;
    // }

    add<T extends IsometricEntity>(entity: T): Reactive<T> {
        const { Engine } = this.rootStore;
        this.children.push(entity);
        entity.parent = this;

        entity._assignWorld(this);
        const { baseDisplayObject, disposers } = entity._render(this.rootStore);
        return Engine.register(entity, baseDisplayObject, disposers);
    }

    _render(rootStore: RootStore) {
        this.rootStore = rootStore;
        const { Engine } = this.rootStore;

        const container = new Container(this.x, this.y);
        const { baseDisplayObject, disposers } = container._render(
            this.rootStore,
        );
        Engine.register(this, baseDisplayObject, disposers);

        return {
            disposers: [],
            baseDisplayObject: baseDisplayObject,
        };
    }

    _update(_rootStore: RootStore, _elapsedMS: number) {}

    // @TODO: remove PIXI dependency
    debugGround() {
        const { Engine } = this.rootStore;
        const displayObject = Engine.getDisplayObject(
            this.id,
        ) as PIXI.Container;

        const graphics = drawRect({
            x: 0,
            y: 0,
            width: this.width,
            height: this.height,
            color: 0x00ff00,
        });

        const pointer = drawRect({
            x: this.uvz2xy({ u: 100, v: 0 }).x - 5,
            y: this.uvz2xy({ u: 100, v: 0 }).y - 5,
            width: 10,
            height: 10,
            color: 0x0000ff,
        });

        const polygon = new PIXI.Graphics();
        graphics.beginFill(0xff0000);
        graphics.drawPolygon([
            this.uvz2xy({ u: 0, v: 0 }),
            this.uvz2xy({ u: 0, v: this.vWidth }),
            this.uvz2xy({ u: this.uWidth, v: this.vWidth }),
            this.uvz2xy({ u: this.uWidth, v: 0 }),
        ]);

        displayObject.addChild(graphics);
        displayObject.addChild(polygon);
        // displayObject.addChild(pointer);
    }
}

export default Scalable(PerformantPositionable(Renderable(World)));
