import * as PIXI from "pixi.js";
import { Entity } from "./Entity";
import { Bullet } from "./Bullet";
import { Player } from "./Player";
import gsap from "gsap";

export class Enemy extends Entity {
  speed: number = 2;
  maxHelth = 3;
  health: number = 3;
  debuf: number = 0;
  target: Player | null = null;
  healthBar: PIXI.Graphics;
  behavior?: (dt: number) => void;
  protected screenWidth: number = 800;
  protected screenHeight: number = 600;

  constructor(texture: PIXI.Texture, startX?: number, startY?: number, screenWidth: number = 800, screenHeight: number = 600) {
    super(texture);
    this.anchor.set(0.5);
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.x = startX ?? Math.random() * screenWidth;
    this.y = startY ?? -screenHeight * 0.1; // 10% от высоты экрана выше экрана

    this.width = screenWidth * 0.06; // 6% от ширины экрана
    this.height = screenHeight * 0.1; // 10% от высоты экрана

    // создаём полоску здоровья
    this.healthBar = new PIXI.Graphics();
    this.healthBar.y = -this.height / 2 - 10; // над врагом
    this.addChild(this.healthBar);

    this.updateHealthBar();
  }

  update(dt: number) {
    if (!this.target) {
      this.y += this.speed * dt;
    } else {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const targetAngle = Math.atan2(dy, dx);

      // плавный поворот к цели
      gsap.to(this, {
        rotation: targetAngle,
        duration: 0.3,
        ease: "power2.out",
      });

      // движение вперёд
      const totalSpeed = this.speed + this.debuf;
      this.x += Math.cos(this.rotation) * totalSpeed * dt;
      this.y += Math.sin(this.rotation) * totalSpeed * dt;
    }

    // если есть кастомное поведение
    this.behavior?.(dt);
  }

  setTarget(val: Player | null) {
    this.target = val;
  }

  setZigzagMovement() {
    let t = 0;
    this.behavior = (dt: number) => {
      t += dt * 0.05;
      this.x += Math.sin(t) * 2;
    };
  }

  onTriggerCollision(other: Entity): void {
    if (other instanceof Bullet) {
      this.takeDamage(other.damage);
    } else if (other instanceof Player) {
      this.entityDestroy();
    }
  }

  takeDamage(amount: number) {
    this.health -= amount;
    this.debuf -= 1.1;

    // анимация удара (мигнуть красным)
    gsap.to(this, { tint: 0xff0000, duration: 0.1, yoyo: true, repeat: 1 });

    this.updateHealthBar();

    if (this.health <= 0) {
      this.entityDestroy();
    }
  }

  updateHealthBar() {
    this.healthBar.clear();

    const barWidth = this.width;
    const barHeight = 6;

    // фон (красный)
    this.healthBar.beginFill(0xff0000);
    this.healthBar.drawRect(-barWidth / 2, 0, barWidth, barHeight);
    this.healthBar.endFill();

    // текущее здоровье (зелёный)
    const healthPercent = Math.max(this.health / this.maxHelth, 0);
    this.healthBar.beginFill(0x00ff00);
    this.healthBar.drawRect(-barWidth / 2, 0, barWidth * healthPercent, barHeight);
    this.healthBar.endFill();
  }
}
