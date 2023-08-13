import { Frame } from "@renderer/features/engine/Frame";
import rootStore from "@renderer/store";

const { Engine } = rootStore;

export function testFramePositioning(n: number) {
    async function randomMovement(frame: InstanceType<typeof Frame>) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        frame.setPosition(x, y);
        requestAnimationFrame(() => {
            randomMovement(frame);
        });
    }

    for (let i = 0; i < n; i++) {
        const frame = new Frame(100, 100, 100, 100, 0xff0000);
        // frame.setScale(3, 3);
        Engine.add(frame);
        randomMovement(frame);
    }
}

export function testFrameMovement(n: number) {
    async function randomMovement(frame: InstanceType<typeof Frame>) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        await frame.moveTo(x, y, { speed: 0.2 });
        randomMovement(frame);
    }

    for (let i = 0; i < n; i++) {
        const frame = new Frame(100, 100, 100, 100, 0xff0000);
        // frame.setScale(3, 3);
        Engine.add(frame);
        randomMovement(frame);
    }
}
