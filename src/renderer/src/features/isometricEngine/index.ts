import { RootStore, Store } from "@renderer/store";
import { Container } from "@renderer/features/engine";

export class IsometricEngine implements Store {
    rootStore: RootStore;
    // world: typeof Container;

    constructor(rootStore: RootStore) {
        const { Engine } = rootStore;
        console.log("IsometricEngine loaded");
        this.rootStore = rootStore;
        // this.world = Engine.add(new Container(0, 0));
    }
}

export default IsometricEngine;
