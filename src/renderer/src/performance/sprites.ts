import rootStore from "@renderer/store";

const { Engine, Assets } = rootStore;
import Sprite from "@renderer/features/engine/sprite";

export async function testSpritePositioning(n: number) {
    Assets.add("pointer", "images/pointer.png");
    await Assets.load("pointer");
    async function randomMovement(sprite) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        sprite.setPosition(x, y);
        requestAnimationFrame(() => {
            randomMovement(sprite);
        });
    }

    for (let i = 0; i < n; i++) {
        const sprite = new Sprite(0, 0, "pointer");
        // sprite.setScale(3, 3);
        Engine.add(sprite);
        randomMovement(sprite);
    }
}

export async function testSpriteMovement(n: number) {
    Assets.add("pointer", "images/pointer.png");
    await Assets.load("pointer");
    async function randomMovement(sprite) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        await sprite.moveTo(x, y, { speed: 0.2, curve: "ease-in" });
        randomMovement(sprite);
    }

    for (let i = 0; i < n; i++) {
        const sprite = new Sprite(0, 0, "pointer");
        // sprite.setScale(3, 3);
        Engine.add(sprite);
        randomMovement(sprite);
    }
}
