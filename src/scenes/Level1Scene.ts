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
import { fragment, vertex } from "../shaders/starsShader";

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
  public shader: PIXI.Shader;
  timeUniform: any
  constructor(game: Game) {
    super(game);
    this.setUpVars();
    this.createStars();
    this.createPlayer();
    this.craateBgFilter()

    this.addShader();

    // --- волны и босс ---
    this.setWaveManager();
  }

  setWaveManager() {
    this.waveManager = new WaveManager([
        {
            count: 5,
            interval: 60,
            onStart: () => this.game.hud.showMessage("1 хвиля"),
            pauseAfter: 120,
            createEnemy: () => {
                const enemy = new Enemy(
                    PIXI.Texture.WHITE,
                    (this.screenWidth / 2) * Math.random(),
                    -100,
                    this.screenWidth,
                    this.screenHeight,
                );
                if(Math.random() < 0.5) {
                    enemy.setTarget(this.player);
                }
                return enemy;
            },
            onComplete: () => this.game.hud.showMessage("1 хвиля ліквідована"),
            },
        {
            count: 10,
            interval: 10,
            onStart: () => this.game.hud.showMessage("2 хвиля"),
            pauseAfter: 280,
            createEnemy: () => {
                const enemy = new Enemy(
                    PIXI.Texture.WHITE,
                    (this.screenWidth) * Math.random() + (this.screenWidth / 4),
                    -100,
                    this.screenWidth,
                    this.screenHeight,
                );
                const size = 40 * Math.random() + 20;
                enemy.width = size;
                enemy.height = size;
                return enemy;
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
          this.game.hud.setBossHealth(boss.health, boss.maxHealth);
          boss.setTarget(this.player);

          boss.events.on("collision", (i, other) => {
            if (other instanceof Bullet) boss.takeDamage(10);
          });
          boss.events.on("damage", (hp, maxHp) => {
            this.game.hud.setBossHealth(hp, maxHp)
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
            // this.bossBullets.add(bossBullet);
            // bossBullet.events.on("destroy", () => this.bossBullets.remove(bossBullet));
            // bossBullet.events.on("collision", (i, other) => {
            //   if (other instanceof Player || other instanceof Bullet) bossBullet.entityDestroy();
            // });
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
  }

  setUpVars() {
    this.screenWidth = this.game.app.screen.width;
    this.screenHeight = this.game.app.screen.height;

    this.gameRenderTexture = PIXI.RenderTexture.create({
        width: this.screenWidth,
        height: this.screenHeight
      });

  }

  addShader() {
    this.shader = PIXI.Filter.from({
        gl: {
            vertex,
            fragment,
          },
          resources: {
            shaderToyUniforms: {
                u_resolution: { value: [640, 360, 1], type: 'vec2<f32>' },

              u_time: { value: 0, type: 'f32' },
              u_player: { value: [640, 360], type: 'vec2<f32>' },
            },
          },
    });

    const quadGeometry = new PIXI.Geometry();
    quadGeometry.addAttribute("aVertexPosition", [
      -1, -1,
       1, -1,
       1,  1,
      -1,  1,
    ], 2);

    quadGeometry.addAttribute("aUV", [
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    ], 2);


    quadGeometry.addIndex([0, 1, 2, 0, 2, 3]);
      const quad = new PIXI.Mesh({
        geometry: quadGeometry,
        shader:this.shader,
      });
    
      quad.width = this.screenWidth;
      quad.height = this.screenHeight;
      quad.x = this.screenWidth / 2;
      quad.y = this.screenHeight / 2;
      quad.zIndex = 0;
      this.game.app.stage.addChild(quad);
  }

  craateBgFilter() {
    this.bgSprite = new PIXI.Sprite();
    this.bgSprite.width = this.screenWidth;
    this.bgSprite.height = this.screenHeight;
    this.bgSprite.anchor.set(0);
    this.bgSprite.zIndex = -1000;
    this.container.addChildAt(this.bgSprite, 0);
    this.timeUniform = { value: 0.0 };

    this.bgFilter = new Filter({
        resources: {
            timeUniforms: {
                uTime: { value: 0.0, type: 'f32' },
              },
        }
    }
    );
  }
  
  createPlayer() {
    this.player = new Player(PIXI.Texture.WHITE, this.screenWidth, this.screenHeight);
    this.container.addChild(this.player);
    this.game.hud.setPlayerHealth(this.player.health, this.player.maxHealth);

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
        this.game.hud.setPlayerHealth(health, this.player.maxHealth);
      });
      
      this.player.events.on("destroy", (health) => {
          this.game.hud.showMessage("DARINKA ZHOPA")
      });
  
      this.player.events.on("collision", (other, item) => {
        if (item instanceof Bonus) {
          const health = ++this.player.health;
          this.game.hud.setPlayerHealth(health, this.player.maxHealth);
        } 
        if(other instanceof BossBullet) {
          this.player.takeDamage();
        }
      });
  }

  removeEnemyHandler(enemy)  {
    this.Enemys.remove(enemy);

    if (Math.random() < 0.15) {
      const bonus = new Bonus(enemy.x, enemy.y, this.screenWidth, this.screenHeight);
      this.bonuses.add(bonus);
      bonus.events.on("collision", (i, other) => {
        if (other instanceof Player) bonus.entityDestroy();
      });
      bonus.events.on("destroy", () => this.bonuses.remove(bonus));
    }

    this.Enemys.entities.forEach((item) => {
      item.setTarget(this.player);
      setTimeout(() => item.setTarget(null), 500)
    });
  }
  

  update(dt: number) {
    this.shader.resources.shaderToyUniforms.uniforms.u_time += 0.005;
    this.shader.resources.shaderToyUniforms.uniforms.u_player = [this.player.x * 1.0, this.screenHeight - this.player.y * 1.0];

    this.player.update(this.input);

    this.waveManager.update(dt, (enemy: Enemy) => {
      this.Enemys.add(enemy);

      enemy.events.on("destroy", () => this.removeEnemyHandler(enemy));
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
