// PIXI.js Engine

import * as PIXI from "pixi.js";
import "@pixi/unsafe-eval";

import { makeAutoObservable } from "mobx";
import { Store, RootStore } from "../store";
import { Frame } from "./frame";

export class EngineStore implements Store {
    rootStore: RootStore;
    ticker: PIXI.Ticker | undefined;
    app: PIXI.Application | undefined;

    frames: { [key: string]: Frame } = {};
    // Do not make them observable
    containers: { [key: string]: PIXI.Container } = {};
    graphics: { [key: string]: PIXI.Graphics } = {};

    constructor(rootStore: RootStore) {
        makeAutoObservable(this);
        this.rootStore = rootStore;
    }

    start() {
        this.app = this.createApp();
        this.ticker = this.app.ticker;
    }

    createApp() {
        const app = new PIXI.Application({
            background: "#000000",
            resizeTo: window,
        });
        // document.body should go in config
        document.body.appendChild(app.view as HTMLCanvasElement);
        return app;
    }
}
