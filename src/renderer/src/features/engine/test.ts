import { RootStore } from "@renderer/store";
import { Container } from "pixi.js";
import { autorun, makeAutoObservable } from "mobx";
import { drawRect } from "./graphics";
import { RenderableEntity, makeId } from "./entity";

export class Frame implements RenderableEntity {
    type = "frame";
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: number;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color = 0xf1f1f1,
    ) {
        makeAutoObservable(this, {
            render: false,
        });
        this.id = makeId();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    // @TODO another options is to move render to EngineStore or to ~method that receives rootStore~
    // Frame doesn't need rootStore then
    // But what if I want to change stuff outside of frame? (eg: actor needs to change sprite)
    render(rootStore: RootStore) {
        const { Engine } = rootStore;

        const container = new Container();
        const bg = drawRect(this);
        container.addChild(bg);

        Engine.addDisplayObject(this.id, container);

        const disposer = autorun(() => {
            Object.assign(container, {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
            });
            bg.clear();
            drawRect({ ...this, x: 0, y: 0, rect: bg });
        });

        return [disposer];
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
