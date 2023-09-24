import { Container } from "@renderer/features/engine/entities/Container";
import rootStore, { Reactive } from "@renderer/store";
import { UVW, XY } from "@renderer/utils/coordinates";
import * as PIXI from "pixi.js";
import { RenderableEntity } from "../engine/entity";
import { drawRect } from "../engine/graphics";
import { IsometricEntity } from "./entity";

// TODO? World -> IsometricSpace
class _World extends Container {
    type = "world";
    children: RenderableEntity[] = [];

    constructor(
        x: number,
        y: number,
        public uWidth: number,
        public vWidth: number,
        public uvwRatio: number,
        public scale = { x: 1, y: 1 },
    ) {
        super(x, y, scale);
    }

    center({ x, y }: { x: number; y: number }) {
        return {
            x: x + this.width / 2,
            y: y + this.height / 2,
        };
    }

    uvw2xyFloat({ u, v, w = 0 }: UVW) {
        const centerOffsetX = this.uWidth * this.uvwRatio;
        const x = u * this.uvwRatio - v * this.uvwRatio + centerOffsetX;
        const y = u + v - w;
        return { x, y };
    }

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
        const { Engine } = rootStore;
        this.children.push(entity);
        entity.parent = this;
        entity._assignWorld(this);
        entity._render();
        return Engine.register(entity);
    }

    // @TODO: remove PIXI dependency
    debugGround() {
        const { Engine } = rootStore;
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

    angleRequiresFlip(angle: number) {
        return (angle >= 45 && angle < 135) || (angle >= 225 && angle < 315);
    }

    textureAngleAdapter(angle: number, texture: string) {
        if (angle >= 45 && angle < 225) {
            return `${texture}_back`;
        } else {
            return texture;
        }
    }

    setTextureAngleAdapter(func: (angle: number, texture: string) => string) {
        this.textureAngleAdapter = func;
    }

    setFlipAngleAdapter(func: (angle: number) => boolean) {
        this.angleRequiresFlip = func;
    }
}

export const World = _World;
