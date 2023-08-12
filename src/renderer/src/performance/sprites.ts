import rootStore from "@renderer/store";

const { Engine, Assets } = rootStore;
import IsometricSprite from "@renderer/features/isometricEngine/sprite";
import { Sprite } from "@renderer/features/engine/sprite";
import { World } from "@renderer/features/isometricEngine/world";

export async function testSpritePositioning(n: number) {
    Assets.add("pointer", "images/pointer.png");
    await Assets.load("pointer");
    async function randomMovement(sprite: InstanceType<typeof Sprite>) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        sprite.setPosition(x, y);
        requestAnimationFrame(() => {
            randomMovement(sprite);
        });
    }

    for (let i = 0; i < n; i++) {
        const sprite = new Sprite(0, 0, "pointer");
        Engine.add(sprite);
        randomMovement(sprite);
    }
}

export async function testSpriteMovement(n: number) {
    Assets.add("pointer", "images/pointer.png");
    await Assets.load("pointer");
    async function randomMovement(sprite: InstanceType<typeof Sprite>) {
        const x = Math.random() * 1000;
        const y = Math.random() * 1000;
        await sprite.moveTo(x, y, { speed: 0.2, curve: "ease-in" });
        randomMovement(sprite);
    }

    for (let i = 0; i < n; i++) {
        const sprite = new Sprite(0, 0, "pointer");
        Engine.add(sprite);
        randomMovement(sprite);
    }
}

export async function testIsometricSpriteMovement(n: number) {
    Assets.add("pointer", "images/pointer.png");
    await Assets.load("pointer");
    async function randomMovement(
        sprite: InstanceType<typeof IsometricSprite>,
    ) {
        const u = Math.random() * 100;
        const v = Math.random() * 100;
        await sprite.moveToUVW(u, v, 0, { speed: 0.2, curve: "ease-in" });
        randomMovement(sprite);
    }
    const world = Engine.add(new World(100, 100, 100, 100, 2 / 1));
    world.setScale(3, 3);
    world.debugGround();

    for (let i = 0; i < n; i++) {
        const pointer = world.add(new IsometricSprite(0, 0, 0, "pointer"));
        randomMovement(pointer);
    }
}
