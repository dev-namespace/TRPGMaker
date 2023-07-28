import { Assets, utils, Texture, Sprite } from "pixi.js";
import { RootStore, Store } from "@renderer/store";
import { makeAutoObservable } from "mobx";

// @TODO: Local vs Filesystem vs Cloud
export class AssetStore implements Store {
    rootStore: RootStore;
    loader: any;

    constructor(rootStore: RootStore) {
        makeAutoObservable(this);
        this.rootStore = rootStore;
    }

    add(key: string, asset: any) {
        return Assets.add(key, asset);
    }

    load(key: string) {
        return Assets.load(key);
    }

    addFS(key: string, path: string) {
        const { Engine } = this.rootStore;
        // await needed? I had it in there before
        const asset = window.api.getAsset(path);
        const blob = new Blob([asset], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        const texture = Texture.from(url);
        utils.TextureCache[key] = texture;

        const t = utils.TextureCache[key];
        const sprite = new Sprite(t);
        Engine.stage.addChild(sprite);
    }
}

function spritesheetMiddleware(resource, next) {
    console.log("!2 inside middleware");
}
