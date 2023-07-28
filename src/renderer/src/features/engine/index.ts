// PIXI.js Engine

import * as PIXI from "pixi.js";
import "@pixi/unsafe-eval";

import { makeAutoObservable } from "mobx";
import { Store, RootStore } from "../store";
// import { Frame, renderFrame } from "./frame";
import { EngineEntity } from "./entity";

export class EngineStore implements Store {
    rootStore: RootStore;
    ticker: PIXI.Ticker | undefined;
    stage: PIXI.Container | undefined;
    app: PIXI.Application | undefined;
    entities: { [key: string]: EngineEntity } = {};

    disposers: { [key: string]: Function[] } = {};
    renderFunctions: { [key: string]: Function } = {};
    displayObjects: { [key: string]: PIXI.DisplayObject } = {};

    constructor(rootStore: RootStore) {
        makeAutoObservable(this, {
            disposers: false,
            renderFunctions: false,
            displayObjects: false,
        });
        this.rootStore = rootStore;
    }

    start() {
        this.app = this.createApp();
        this.stage = this.app.stage;
        this.ticker = this.app.ticker;
    }

    createApp() {
        const app = new PIXI.Application({
            background: "#000000",
            resizeTo: window,
        });
        // @TODO: document.body should go in config
        document.body.appendChild(app.view as HTMLCanvasElement);
        return app;
    }

    add(entity: EngineEntity) {
        this.entities[entity.id] = entity;
        const disposers = this.renderEntity(entity);
        this.disposers[entity.id] = disposers;
    }

    remove(entity: EngineEntity) {
        delete this.entities[entity.id];
        for (let disposer of this.disposers[entity.id]) {
            disposer();
        }
    }

    private renderEntity(entity: EngineEntity): Function[] {
        return this.renderFunctions[entity.type](entity);
    }

    addDisplayObject(entityId: string, displayObject: PIXI.DisplayObject) {
        this.displayObjects[entityId] = displayObject;
        this.stage?.addChild(displayObject);
    }

    removeDisplayObject(entityId: string) {
        this.stage?.removeChild(this.displayObjects[entityId]);
    }
}
