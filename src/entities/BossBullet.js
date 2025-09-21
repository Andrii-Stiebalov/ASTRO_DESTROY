import * as PIXI from "pixi.js";
import { Entity } from "./Entity";
import { Player } from "./Player";
export class BossBullet extends Entity {
    fromPlayer = false;
    damage = 2;
    speed = 3;
    constructor(x, y, screenWidth = 800, screenHeight = 600) {
        super(PIXI.Texture.WHITE);
        this.tint = 0xff0000;
        this.width = screenWidth * 0.006;
        this.height = screenHeight * 0.006;
        this.position.set(x, y);
    }
    onTriggerCollision(other) {
        if (other instanceof Player) {
            this.kill();
        }
    }
    update(dt) {
        this.y += this.speed * dt;
        this.x += this.speed * 0.2;
        if (this.y > 720) {
            this.entityDestroy();
        }
    }
}
