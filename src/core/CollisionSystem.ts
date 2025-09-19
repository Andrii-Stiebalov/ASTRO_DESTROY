import { Player } from "../entities/Player";
import { Bullet } from "../entities/Bullet";
import * as PIXI from "pixi.js";
import { Entity } from "../entities/Entity";

export class CollisionSystem {
  // Проверка AABB коллизии
  checkCollisions(entities: Entity[]) {
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const a = entities[i];
        const b = entities[j];
  
        if (this.isIntersecting(a, b)) {
          a.triggerCollision(b);
          b.triggerCollision(a);
        }
      }
    }
  }

  isIntersecting(a: Entity, b: Entity): boolean {
    return (
      Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
      Math.abs(a.y - b.y) < (a.height + b.height) / 2
    );
  }
}
