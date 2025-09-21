import * as PIXI from "pixi.js";
import { Entity } from "./Entity";
export class Bonus extends Entity {
    fromPlayer = true;
    damage = 1;
    constructor(x, y, screenWidth = 800, screenHeight = 600) {
        super(PIXI.Texture.WHITE);
        this.tint = 0xff0000;
        this.width = 20; // 2% от ширины экрана
        this.height = 20; // 2.5% от высоты экрана
        this.position.set(x, y);
    }
    onTriggerCollision(other) {
        this.kill();
    }
    update() {
        this.y += 0.8;
        if (this.y < 0) {
            this.entityDestroy();
        }
    }
}
