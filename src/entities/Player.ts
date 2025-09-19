import * as PIXI from "pixi.js";
import { Entity } from "./Entity";
import { Bullet } from "./Bullet";
import { Enemy } from "./Enemy";

export class Player extends Entity {
  public helth = 3;
  public maxHelth = 3;
  public shootCooldown = 0;
  constructor(texture: PIXI.Texture, screenWidth: number = 800, screenHeight: number = 600) {
    super(texture);
    this.anchor.set(0.5);
    this.x = screenWidth / 2; // центр экрана по X
    this.y = screenHeight * 0.9; // 90% от высоты экрана (внизу)
    this.width = screenWidth * 0.04; // 4% от ширины экрана
    this.height = screenHeight * 0.07; // 7% от высоты экрана
  }

  onTriggerCollision(other: Entity): void {
    if (other instanceof Enemy) {
        if(this.helth > 0) {
            this.takeDamage();
        } else {
            this.events.emit('destroy')
        }
    }
  }

  shoot() {
    if(this.shootCooldown <= 0) {
        this.events.emit("shoot", this);
        this.shootCooldown = 20;
    } else {
            this.shootCooldown -= 1;
    }

  }

  update(input: any) {
    if (input.isPressed("ArrowLeft")) this.x -= 5;
    if (input.isPressed("ArrowRight")) this.x += 5;
    if (input.isPressed("ArrowDown")) this.y += 5;
    if (input.isPressed("ArrowUp")) this.y -= 5;
    if (input.isPressed("Space")) {
        this.shoot()
      }
    
     
  }

  takeDamage() {
    this.helth -= 1;
    this.events.emit('damage', this.helth)
  }
}

