import rootStore from "@renderer/store";
import { autorun, makeObservable } from "mobx";
import { BlurFilter } from "pixi.js";
import { UpdatableEntity, makeId } from "./entity";
import {
    IPositionMixin,
    MovementOptions,
    Positionable,
} from "./mixins/position";

class _Camera implements UpdatableEntity {
    type = "camera";
    id: string;
    width: number = 0;
    height: number = 0;
    blur?: number;

    declare moveTo: IPositionMixin["moveTo"];
    declare setPosition: IPositionMixin["setPosition"];
    declare x: IPositionMixin["x"];
    declare y: IPositionMixin["y"];

    constructor(x: number, y: number) {
        makeObservable(this, {
            setBlur: true,
        });
        this.id = makeId();
        this.setPosition(x, y);
    }

    setBlur(value: number) {
        this.blur = value;
    }

    focus(x: number, y: number) {
        this.setPosition(x - this.width / 2, y - this.height / 2);
    }

    moveToFocus(x: number, y: number, options: MovementOptions) {
        return this.moveTo(x - this.width / 2, y - this.height / 2, options);
    }

    _render() {
        const { Engine } = rootStore;

        this.width = Engine.app!.view.width;
        this.height = Engine.app!.view.height;

        const onResize = (_event: any) => {
            this.width = Engine.app!.view.width;
            this.height = Engine.app!.view.height;
        };

        window.addEventListener("resize", onResize);

        Engine.addReactions(this, [
            autorun(() => {
                Engine.stage!.position.set(-this.x, -this.y);
            }),
            autorun(() => {
                if (this.blur) {
                    Engine.stage!.filters = [new BlurFilter(this.blur)];
                } else {
                    Engine.stage!.filters = [];
                }
            }),
            // @ts-ignore: non-mobx disposer @TODO
            (): any => {
                window.removeEventListener("resize", onResize);
            },
        ]);
    }

    _update(_elapsed: number) {}
}

export const Camera = Positionable(_Camera);
