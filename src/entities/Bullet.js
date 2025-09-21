import * as PIXI from "pixi.js";
import { Entity } from "./Entity";
import { Bonus } from "./Bonus";
export class Bullet extends Entity {
    fromPlayer = true;
    damage = 1;
    constructor(x, y, screenWidth = 800, screenHeight = 600) {
        super(PIXI.Texture.WHITE);
        this.tint = 0xffff00;
        this.width = screenWidth * 0.004; // 0.4% от ширины экрана
        this.height = screenHeight * 0.007; // 0.7% от высоты экрана
        this.position.set(x, y);
    }
    onTriggerCollision(other) {
        if (other instanceof Bonus) {
            return;
        }
        this.kill();
    }
    update() {
        this.y -= 10;
        if (this.y < 0) {
            this.entityDestroy();
        }
    }
}
