import { Scene } from "../core/Scene";
import type { Game } from "../core/Game";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Bullet } from "../entities/Bullet";
import { Input } from "../core/Input";
import * as PIXI from "pixi.js";
import { Bonus } from "../entities/Bonus";
import { WaveManager } from "../core/WaveManager";
import { Boss } from "../entities/Boss";
import { BossBullet } from "../entities/BossBullet";
import { Filter, GlProgram } from "pixi.js";
import { starFragment, starVertex } from "../shaders/starsShader";

type Updatable = { update?: (dt: number) => void };

class EntityManager<T extends PIXI.Sprite & Updatable> {
  entities: T[] = [];
  container: PIXI.Container;

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  add(entity: T) {
    this.entities.push(entity);
    this.container.addChild(entity);
  }

  remove(entity: T) {
    const index = this.entities.indexOf(entity);
    if (index >= 0) this.entities.splice(index, 1);
    if (entity.parent) entity.parent.removeChild(entity);
  }

  update(dt: number) {
    this.entities.forEach((e) => e.update?.(dt));
  }
}

export class Level1Scene extends Scene {
  player: Player;
  input = new Input();
  bullets = new EntityManager<Bullet>(this.container);
  bossBullets = new EntityManager<BossBullet>(this.container);
  Enemys = new EntityManager<Enemy>(this.container);
  bonuses = new EntityManager<Bonus>(this.container);
  waveManager: WaveManager;
  private screenWidth: number;
  private screenHeight: number;
  private bgSprite: PIXI.Sprite;
  private bgFilter: Filter;
  timeUniform: any
  constructor(game: Game) {
    super(game);
    this.createStars();
    this.screenWidth = game.app.screen.width;
    this.screenHeight = game.app.screen.height;

    // --- игрок ---
    this.player = new Player(PIXI.Texture.WHITE, this.screenWidth, this.screenHeight);
    this.container.addChild(this.player);
    this.game.hud.setPlayerHealth(this.player.helth, this.player.maxHelth);

    // --- фон со звездами ---
    this.bgSprite = new PIXI.Sprite();
    this.bgSprite.width = this.screenWidth;
    this.bgSprite.height = this.screenHeight;
    this.bgSprite.anchor.set(0);
    this.bgSprite.zIndex = -1000;
    this.container.addChildAt(this.bgSprite, 0);
    this.timeUniform = { value: 0.0 };

    this.bgFilter = new Filter({
        glProgram: new GlProgram({ vertex:starVertex , fragment:starFragment }),
        resources: {
            timeUniforms: {
                uTime: { value: 0.0, type: 'f32' },
              },
            u_starDensity: 60.0,
            u_sharpness: 25.0,
            u_tint: [{ value: 0.0, type: 'f32' }, { value: 0.0, type: 'f32' }, { value: 0.0, type: 'f32' }]
        }
    }
    );
    
      

    this.bgSprite.filters = [this.bgFilter];

    // --- волны и босс ---
    this.waveManager = new WaveManager([
        {
            count: 20,
            interval: 60,
            onStart: () => this.game.hud.showMessage("1 хвиля"),
            createEnemy: () => {
                const boss = new Enemy(
                    PIXI.Texture.WHITE,
                    (this.screenWidth / 2) * Math.random(),
                    -100,
                    this.screenWidth,
                    this.screenHeight,
                );
                return boss;
            },
            onComplete: () => this.game.hud.showMessage("1 хвиля -"),
            },
        {
            count: 30,
            interval: 30,
            onStart: () => this.game.hud.showMessage("2 хвиля"),
            createEnemy: () => {
                const boss = new Enemy(
                    PIXI.Texture.WHITE,
                    (this.screenWidth / 2) * Math.random(),
                    -100,
                    this.screenWidth,
                    this.screenHeight,
                );
                return boss;
            },
            onComplete: () => this.game.hud.showMessage("2 хвиля ліквідована"),
            },
      {
        count: 1,
        interval: 9999,
        onStart: () => this.game.hud.showMessage("Босс выходит!"),
        createEnemy: () => {
          const boss = new Boss(
            PIXI.Texture.WHITE,
            this.screenWidth / 2,
            150,
            this.screenWidth,
            this.screenHeight,
            this.player
          );
          boss.speed = 2;
          this.game.hud.setBossHealth(boss.health, boss.maxHelth);
          boss.setTarget(this.player);

          boss.events.on("damage", (hp: number, max: number) => {
            this.game.hud.setBossHealth(hp, max);
          });

          boss.events.on("destroy", () => this.game.hud.setBossHealth(0, 0));

          boss.events.on("giveItem", (item) => {
            const bonus = new Bonus(boss.x, boss.y, this.screenWidth, this.screenHeight);
            this.bonuses.add(bonus);
            bonus.events.on("collision", (i, other) => {
              if (other instanceof Player) bonus.entityDestroy();
            });
            bonus.events.on("destroy", () => this.bonuses.remove(bonus));
          });

          boss.events.on("bossShoot", (bossBullet: BossBullet) => {
            this.bossBullets.add(bossBullet);
            bossBullet.events.on("destroy", () => this.bossBullets.remove(bossBullet));
            bossBullet.events.on("collision", (i, other) => {
              if (other instanceof Player || other instanceof Bullet) bossBullet.entityDestroy();
            });
          });

          boss.events.on("spawnSubEnemy", (subEnemy: Enemy) => {
            this.Enemys.add(subEnemy);
            subEnemy.events.on("destroy", () => this.Enemys.remove(subEnemy));
          });

          return boss;
        },
        onComplete: () => this.game.hud.showMessage("Босс побеждён!"),
      },
    ]);

    this.waveManager.onAllComplete = () => {
      this.game.hud.showMessage("Уровень пройден!");
    };

    // --- стрельба игрока ---
    this.player.events.on("shoot", (player) => {
      const { x, y, height } = player;
      const bullet = new Bullet(x, y - height / 2, this.screenWidth, this.screenHeight);
      this.bullets.add(bullet);

      bullet.events.on("destroy", (val) => this.bullets.remove(val));
      bullet.events.on("collision", (other) => {
        if (other instanceof Enemy) {
          other.takeDamage(1);
          bullet.entityDestroy();
        }
      });
    });

    // --- урон игрока ---
    this.player.events.on("damage", (health) => {
      this.game.hud.setPlayerHealth(health, this.player.maxHelth);
    });

    // --- бонусы ---
    this.player.events.on("collision", (other, item) => {
      if (item instanceof Bonus) {
        const health = ++this.player.helth;
        this.game.hud.setPlayerHealth(health, this.player.maxHelth);
      } 
      if(other instanceof BossBullet) {
        const health = --this.player.helth;
        this.game.hud.setPlayerHealth(health, this.player.maxHelth);
      }
    });
  }

  update(dt: number) {
    this.player.update(this.input);
    this.drawStars();
    // обновление фильтра фона
    this.bgFilter.resources.timeUniforms.uniforms.uTime += 0.04

    // обновляем волны
    this.waveManager.update(dt, (enemy: Enemy) => {
      this.Enemys.add(enemy);

      enemy.events.on("destroy", () => {
        this.Enemys.remove(enemy);

        // шанс на бонус
        if (Math.random() < 0.15) {
          const bonus = new Bonus(enemy.x, enemy.y, this.screenWidth, this.screenHeight);
          this.bonuses.add(bonus);
          bonus.events.on("collision", (i, other) => {
            if (other instanceof Player) bonus.entityDestroy();
          });
          bonus.events.on("destroy", () => this.bonuses.remove(bonus));
        }

        // реакция врагов
        this.Enemys.entities.forEach((item) => {
          item.setTarget(this.player);
          setTimeout(() => item.setTarget(null), 500);
        });
      });
    });

    this.bullets.update(dt);
    this.bossBullets.update(dt);
    this.Enemys.update(dt);
    this.bonuses.update(dt);
    this.game.hud.update(dt);

    // коллизии
    const entities = [
      this.player,
      ...this.bullets.entities,
      ...this.bossBullets.entities,
      ...this.Enemys.entities,
      ...this.bonuses.entities,
    ].filter(Boolean);

    this.collisionSystem.checkCollisions(entities);
  }
}
