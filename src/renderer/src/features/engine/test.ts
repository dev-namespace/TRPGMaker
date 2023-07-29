import { RootStore, Store } from "@renderer/store";
import { Container } from "pixi.js";
import { autorun } from "mobx";
import { drawRect } from "./graphics";
import { EngineEntity, makeEntity } from "./entity";

export interface Frame extends EngineEntity {
    type: "frame";
    x: number;
    y: number;
    width: number;
    height: number;
    color: number;
}

export class FrameModule implements Store {
    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.rootStore.Engine.renderFunctions["frame"] = this.render.bind(this);
    }

    make(x, y, width, height, color = 0xf1f1f1): Frame {
        return makeEntity({
            x,
            y,
            width,
            height,
            color,
            type: "frame",
        }) as Frame;
    }

    private render(frame: Frame) {
        const { Engine } = this.rootStore;

        const container = new Container();
        const bg = drawRect(frame);
        container.addChild(bg);

        Engine.addDisplayObject(frame.id, container);

        const disposer = autorun(() => {
            const entity = Engine.entities[frame.id];
            Object.assign(container, {
                x: entity.x,
                y: entity.y,
                width: entity.width,
                height: entity.height,
            });
            bg.clear();
            drawRect({ ...entity, x: 0, y: 0, rect: bg });
        });

        return [disposer];
    }

    add(
        x: number,
        y: number,
        width: number,
        height: number,
        color = 0xf1f1f1,
    ): Frame {
        const frame = this.make(x, y, width, height, color);
        return this.rootStore.Engine.add(frame);
    }
}
