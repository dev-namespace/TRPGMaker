import { DisplayObject } from "@renderer/features/engine";
import * as PIXI from "pixi.js";
import { drawRect } from "../engine/graphics";
import { Reactive, RootStore } from "@renderer/store";
import { Container, IContainer } from "../engine/container";
import { RenderableEntity, makeId } from "../engine/entity";
import { Renderable } from "../engine/mixins/render";
import { PerformantPositionable } from "../engine/mixins/position";
import { Scalable } from "../engine/mixins/scale";
import { IsometricEntity } from "./entity";

// TODO World -> IsometricSpace
class _World implements IContainer {
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

    uvz2xy({ u, v, z = 0 }: { u: number; v: number; z?: number }) {
        const centerOffsetX = this.uWidth * this.uvzRatio;
        const x = Math.round(
            u * this.uvzRatio - v * this.uvzRatio + centerOffsetX,
        );
        const y = Math.round(u + v - z);
        return { x, y };
    }

    xy2uvz({ x, y }: { x: number; y: number }) {
        const centerOffsetX = this.uWidth * this.uvzRatio;
        const u = (x + y * this.uvzRatio - centerOffsetX) / (2 * this.uvzRatio);
        const v =
            y - (x + y * this.uvzRatio - centerOffsetX) / (2 * this.uvzRatio);
        const z = 0; // Cannot be calculated from x and y
        return { u, v, z };
    }

    // getZIndex({ u, v, z = 0 }: { u: number; v: number; z?: number }) {
    //     return u + v + z;
    // }

    getZIndex({ u, v, z = 0 }: { u: number; v: number; z?: number }) {
        u = u % 1 > 0.15 ? Math.ceil(u) : Math.floor(u);
        v = v % 1 > 0.15 ? Math.ceil(v) : Math.floor(v);
        return (u + v) * 100 + z * 10;
    }

    get width() {
        return this.uvz2xy({ u: this.uWidth, v: 0, z: 0 }).x;
    }

    get height() {
        return this.uvz2xy({ u: this.uWidth, v: this.vWidth, z: 0 }).y;
    }

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
    }
}

export const World = Scalable(PerformantPositionable(Renderable(_World)));
