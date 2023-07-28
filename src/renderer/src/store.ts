import { EngineStore } from "@renderer/features/engine";
import { AssetStore } from "./features/assets";

export type RootStore = any;

export interface Store {
    rootStore: RootStore;
}

const rootStore: RootStore = {};

rootStore.Engine = new EngineStore(rootStore);
rootStore.Assets = new AssetStore(rootStore);

export default rootStore;
