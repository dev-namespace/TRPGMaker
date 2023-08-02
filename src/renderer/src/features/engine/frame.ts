import { RootStore } from "@renderer/store";
import { Container, Graphics } from "pixi.js";
import { autorun, makeObservable, observable } from "mobx";
import { drawRect } from "./graphics";
import { RenderableEntity, makeId } from "./entity";
import { PerformantPositionable } from "./mixins/position";
import { Scalable } from "./mixins/scale";
import { pick } from "lodash";

class Frame implements RenderableEntity {
    type = "frame";
    id: string;

    // Accessible mixin properties
    scale = { x: 1, y: 1 };

    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public color = 0xf1f1f1,
    ) {
        makeObservable(this, {
            width: observable,
            height: observable,
        });
        this.id = makeId();
    }

    // @TODO: what if I need to access a mixin property? will probably have to redeclare here
    _render(rootStore: RootStore) {
        const { Engine } = rootStore;

        const container = new Container();
        const bg = new Graphics();
        container.addChild(bg);

        Engine.addDisplayObject(this.id, container);

        const disposers = [
            autorun(() => {
                container.position.set(this.x, this.y);
            }),
            autorun(() => {
                Object.assign(container, pick(this, ["width", "height"]));
                bg.clear();
                drawRect(
                    { x: 0, y: 0, ...pick(this, ["width", "height", "color"]) },
                    bg,
                );
            }),
        ];

        return { disposers, baseDisplayObject: container };
    }

    _update(_rootStore: RootStore, _delta: number) {}

    // TODO: serialize -> lodash pick without _render
    // TODO: unserialize
}

export default Scalable(PerformantPositionable(Frame));
