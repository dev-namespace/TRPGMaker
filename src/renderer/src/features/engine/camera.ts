import { autorun, makeObservable } from "mobx";
import { UpdatableEntity, makeId } from "./entity";
import { Disposer, RootStore } from "@renderer/store";
import {
    IPositionMixin,
    MovementOptions,
    Positionable,
} from "./mixins/position";
import { DisplayObject } from ".";
import { BlurFilter } from "pixi.js";

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

    _render(rootStore: RootStore) {
        const { Engine } = rootStore;

        this.width = Engine.app!.view.width;
        this.height = Engine.app!.view.height;

        const onResize = (_event: any) => {
            this.width = Engine.app!.view.width;
            this.height = Engine.app!.view.height;
        };

        window.addEventListener("resize", onResize);

        const disposers = [
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
            (): any => {
                window.removeEventListener("resize", onResize);
            },
        ] as Disposer[];
        return {
            disposers: disposers,
            baseDisplayObject: Engine.stage! as DisplayObject,
        };
    }

    _update(_rootStore: RootStore, _elapsed: number) {}
}

export const Camera = Positionable(_Camera);
