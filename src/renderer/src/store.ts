import { ObservableValue } from "mobx/dist/internal";
import { EngineStore } from "@renderer/features/engine";
import { AssetStore } from "./features/assets";

export type RootStore = {
    Engine: EngineStore;
    Assets: AssetStore;
};
export type Reactive<T> = T & ObservableValue<T>;
export type Disposer = () => void;

export interface Store {
    rootStore: RootStore;
}

export interface StoreModule {
    rootStore: RootStore;
}

const rootStore: RootStore = {} as RootStore;

rootStore.Assets = new AssetStore(rootStore);
rootStore.Engine = new EngineStore(rootStore);
rootStore.Engine.loadModules();

export default rootStore;
