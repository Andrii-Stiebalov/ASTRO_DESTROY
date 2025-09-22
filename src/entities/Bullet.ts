import * as PIXI from "pixi.js";
import { Entity } from "./Entity";
import { Bonus } from "./Bonus";

export class Bullet extends Entity {
  public fromPlayer: boolean = true;
  public damage: number = 1;
  constructor(x: number, y: number, screenWidth: number = 800, screenHeight: number = 600) {
    super(PIXI.Texture.WHITE);
    this.tint = 0xd736ee;
    this.width = screenWidth * 0.004; // 0.4% от ширины экрана
    this.height = screenHeight * 0.01; // 0.7% от высоты экрана
    this.position.set(x, y);
  }
  onTriggerCollision(other: Entity): void {
    if(other instanceof Bonus) {
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
