import * as PIXI from "pixi.js";
import { Enemy } from "./Enemy";
import { Player } from "./Player";
import { Bullet } from "./Bullet";
import { BossBullet } from "./BossBullet";

export class Boss extends Enemy {
  maxHelth = 100;
  health = 100;
  speed = 1.5;
  shootCooldown = 0;
  subEnemyCooldown = 0;
  target: Player | null;

  private hpBar: PIXI.Graphics;

  constructor(texture: PIXI.Texture, startX: number = 10, startY: number = 10, screenWidth: number, screenHeight: number, target) {
    super(texture, startX, startY, screenWidth, screenHeight);
    this.width = screenWidth * 0.15;
    this.height = screenHeight * 0.25;
    this.hpBar = new PIXI.Graphics();
    this.addChild(this.hpBar);
    this.updateHpBar();
    this.target = target;
  }

  updateHpBar() {
    this.hpBar.clear();
    this.hpBar.beginFill(0xff0000);
    this.hpBar.drawRect(200, 130, (this.health / this.maxHelth) * 200, 100);
    this.hpBar.endFill();
  }

  takeDamage(amount: number) {
    this.health -= amount;
    this.updateHpBar();
    this.events.emit('damage', this.health, this.maxHelth);
    if (this.health <= 0) {
      this.entityDestroy();
    }
  }

  update(dt: number) {
    this.shootCooldown -= dt;
    this.subEnemyCooldown -= dt;

    // Стрельба по игроку
    if (this.shootCooldown <= 0) {
      this.shoot();
      this.shootCooldown = 40;
    }

    // Спавн под-врагов
    if (this.subEnemyCooldown <= 0) {
      this.spawnSubEnemy();
      this.subEnemyCooldown = 60;
    }
  }

  setTarget(player: Player) {
    this.target = player;
  }

  shoot() {
    for (let i = 0; i <= 5; i++) {
      const bossBullet = new BossBullet(
        i * (this.screenWidth / 5), 
        this.y + this.height / 2,
        this.screenWidth,
        this.screenHeight
      );
      this.events.emit('bossShoot', bossBullet);
    }
  }

  spawnSubEnemy() {
    // Создаём под-врага
    const subEnemy = new Enemy(PIXI.Texture.WHITE, undefined, undefined, this.screenWidth, this.screenHeight);
    subEnemy.x =(Math.random()) * this.screenWidth;
    subEnemy.y = this.y - this.height;
    subEnemy.speed = 2;
    subEnemy.width = this.width * 0.2;
    subEnemy.height = this.height * 0.2;
    subEnemy.maxHelth = 1;
    subEnemy.health = 1;
    subEnemy.target = this.target;
    
    this.events.emit('spawnSubEnemy', subEnemy);
    if(true) {
      this.events.emit('giveItem', subEnemy);
    }
  }
}
