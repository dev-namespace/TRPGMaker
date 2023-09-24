import * as PIXI from "pixi.js";
import "@pixi/unsafe-eval";
import { addStats } from "pixi-stats";

import { makeAutoObservable } from "mobx";
import { EngineEntity, RenderableEntity, UpdatableEntity } from "./entity";
import { Store, RootStore, Reactive, Disposer } from "@renderer/store";
import { UPDATE_PRIORITY } from "pixi.js";

export type DisplayObject = PIXI.DisplayObject;
export type RenderFunction = () => void;
export type UpdateFunction = (elapsedMS: number) => void;

export type BaseSprite = PIXI.Sprite;
export type BaseContainer = PIXI.Container;

export class EngineStore implements Store {
    rootStore: RootStore;
    ticker: PIXI.Ticker | undefined;
    stage: PIXI.Container | undefined;
    app: PIXI.Application | undefined;

    entities: { [key: string]: RenderableEntity } = {};
    disposers: { [key: string]: Disposer[] } = {};
    renderFunctions: { [key: string]: RenderFunction } = {};
    displayObjects: { [key: string]: PIXI.DisplayObject } = {};

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, {
            entities: false,
            disposers: false,
            renderFunctions: false,
            displayObjects: false,
            rootStore: false,
        });
        this.rootStore = rootStore;
    }

    async start(parent: HTMLElement) {
        this.app = this.createApp(parent);
        this.stage = this.app.stage;
        this.ticker = this.app.ticker;
        const stats = addStats(document, this.app);

        globalThis.__PIXI_APP__ = this.app;
        this.ticker.minFPS = 60;
        this.ticker.maxFPS = 165;

        this.app.renderer.events.cursorStyles.default =
            "url('images/pointer.png'),auto";

        // this.app.renderer.events.cursorStyles.hover = hoverIcon;
        this.ticker.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);

        this.ticker.add(() => {
            for (let entity of Object.values(this.entities)) {
                // console.log(this.ticker!.elapsedMS);
                entity._update(this.ticker!.elapsedMS);
            }
        });
    }

    createApp(parent: HTMLElement) {
        const app = new PIXI.Application({
            background: "#000000",
            resizeTo: window,
        });
        parent.appendChild(app.view as HTMLCanvasElement);
        return app;
    }

    // @TODO: Renderable or Updatable?
    add<T extends UpdatableEntity>(entity: T): Reactive<T> {
        this.entities[entity.id] = entity;
        entity._render();
        return this.entities[entity.id] as Reactive<T>; // return the proxy
    }

    register<T extends RenderableEntity>(entity: T): Reactive<T> {
        this.entities[entity.id] = entity;
        return this.entities[entity.id] as Reactive<T>; // return the proxy
    }

    _register<T extends RenderableEntity>(
        entity: T,
        displayObject: DisplayObject,
        disposers: Disposer[],
    ): Reactive<T> {
        this.entities[entity.id] = entity;
        this.disposers[entity.id] = disposers;
        this.displayObjects[entity.id] = displayObject;
        return this.entities[entity.id] as Reactive<T>; // return the proxy
    }

    addReactions(entity: RenderableEntity, disposers: Disposer[]) {
        this.disposers[entity.id] = [
            ...(this.disposers[entity.id] || []),
            ...disposers,
        ];
    }

    remove(entity: EngineEntity) {
        delete this.entities[entity.id];
        for (let disposer of this.disposers[entity.id]) {
            disposer();
        }
    }

    getDisplayObject(entityId: string) {
        return this.displayObjects[entityId];
    }

    appendToParent(entity: RenderableEntity) {
        const entityDisplayObject = this.displayObjects[entity.id];
        const container = entity.parent
            ? (this.displayObjects[entity.parent.id] as PIXI.Container)
            : this.stage!;

        this.removeDisplayObject(entity.id);
        container.addChild(entityDisplayObject);
    }

    addDisplayObject(entityId: string, displayObject: PIXI.DisplayObject) {
        this.displayObjects[entityId] = displayObject;
    }

    removeDisplayObject(entityId: string) {
        if (this.displayObjects[entityId]) {
            this.stage?.removeChild(this.displayObjects[entityId]);
        }
    }
}
