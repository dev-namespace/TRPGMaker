import { Assets } from "pixi.js";
import { RootStore, Store } from "@renderer/store";
import { makeAutoObservable } from "mobx";

// @TODO: Local vs Filesystem vs Cloud
export class AssetStore implements Store {
    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        makeAutoObservable(this);
        this.rootStore = rootStore;
    }

    // Not working :(
    add(key: string, asset: any) {
        return Assets.add(key, asset);
    }

    // loadImage(key: string, url: string) {}

    get(key: string) {
        console.log("!2 getting", key);
        return Assets.load(key);
    }
}
