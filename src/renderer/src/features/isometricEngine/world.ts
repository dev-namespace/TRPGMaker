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
import { UVW, XY } from "@renderer/utils/coordinates";

// TODO World -> IsometricSpace
class _World implements IContainer {
    type = "world";
    parent?: IContainer;
    children: RenderableEntity[] = [];
    id: string;
    _initialPosition: XY;

    // definately initialized by _render
    baseDisplayObject!: DisplayObject;
    container!: IContainer;
    rootStore!: RootStore;

    constructor(
        x: number,
        y: number,
        public uWidth: number,
        public vWidth: number,
        public uvwRatio: number,
        public scale = { x: 1, y: 1 },
    ) {
        this.id = makeId();
        this._initialPosition = { x, y };
    }

    center({ x, y }: { x: number; y: number }) {
        return {
            x: x + this.width / 2,
            y: y + this.height / 2,
        };
    }

    // @TODO: not taking scale into account!!!
    uvw2xy({ u, v, w = 0 }: UVW) {
        const centerOffsetX = this.uWidth * this.uvwRatio;
        const x = Math.round(
            u * this.uvwRatio - v * this.uvwRatio + centerOffsetX,
        );
        const y = Math.round(u + v - w);
        return { x, y };
    }

    xy2uvw({ x, y }: XY, w: number) {
        y = y + w;
        const centerOffsetX = this.uWidth * this.uvwRatio;
        const u = (x + y * this.uvwRatio - centerOffsetX) / (2 * this.uvwRatio);
        const v =
            y - (x + y * this.uvwRatio - centerOffsetX) / (2 * this.uvwRatio);
        return { u, v, w };
    }

    xy2u({ x, y }: XY, w: number) {
        y = y + w;
        return (
            (x + y * this.uvwRatio - this.uWidth * this.uvwRatio) /
            (2 * this.uvwRatio)
        );
    }

    xy2v({ x, y }: XY, w: number) {
        y = y + w;
        return (
            y -
            (x + y * this.uvwRatio - this.uWidth * this.uvwRatio) /
                (2 * this.uvwRatio)
        );
    }

    // getZIndex({ u, v, z = 0 }: { u: number; v: number; z?: number }) {
    //     return u + v + z;
    // }

    // @TODO Make this work for any isometric angle
    getZIndex({ u, v, w = 0 }: UVW) {
        u = u % 1 > 0.15 ? Math.ceil(u) : Math.floor(u);
        v = v % 1 > 0.15 ? Math.ceil(v) : Math.floor(v);
        return (u + v) * 100 + w * 10;
    }

    get width() {
        return this.uvw2xy({ u: this.uWidth, v: 0, w: 0 }).x;
    }

    get height() {
        return this.uvw2xy({ u: this.uWidth, v: this.vWidth, w: 0 }).y;
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

        const container = new Container(
            this._initialPosition.x,
            this._initialPosition.y,
        );

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
            this.uvw2xy({ u: 0, v: 0, w: 0 }),
            this.uvw2xy({ u: 0, v: this.vWidth, w: 0 }),
            this.uvw2xy({ u: this.uWidth, v: this.vWidth, w: 0 }),
            this.uvw2xy({ u: this.uWidth, v: 0, w: 0 }),
        ]);

        displayObject.addChild(graphics);
        displayObject.addChild(polygon);
    }
}

export const World = Scalable(PerformantPositionable(Renderable(_World)));
