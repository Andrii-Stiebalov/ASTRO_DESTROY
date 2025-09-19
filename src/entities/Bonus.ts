import * as PIXI from "pixi.js";
import { Entity } from "./Entity";

export class Bonus extends Entity {
  public fromPlayer: boolean = true;
  public damage: number = 1;
  constructor(x: number, y: number, screenWidth: number = 800, screenHeight: number = 600) {
    super(PIXI.Texture.WHITE);
    this.tint = 0xff0000;
    this.width = screenWidth * 0.02; // 2% от ширины экрана
    this.height = screenHeight * 0.025; // 2.5% от высоты экрана
    this.position.set(x, y);
  }
  onTriggerCollision(other: Entity): void {
    this.kill();
  }
  update() {
    this.y += 0.8;
    if (this.y < 0) {
      this.entityDestroy();
    }
  }  
}