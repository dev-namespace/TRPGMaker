import { EngineStore } from "@renderer/features/engine";
import { RootStore } from "@renderer/features/store";
import { when } from "mobx";

const rootStore: RootStore = {};

rootStore.Engine = new EngineStore(rootStore);

const { Engine } = rootStore;

when(
    () => Engine.app,
    () => {
        console.log("!2 app created");
    },
);

export default rootStore;
