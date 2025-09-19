import * as PIXI from "pixi.js";

import { Enemy } from "../entities/Enemy";
import { Spawner } from "./Spawner";

type WaveConfig = {
    count: number;               // сколько врагов
    interval: number;            // интервал между спавнами (в тиках dt)
    behavior?: (enemy: Enemy) => void; // индивидуальный скрипт поведения
    createEnemy?: () => Enemy;   // фабрика создания врага для гибкости типов
    pauseAfter?: number;         // пауза после волны (в тиках dt)
    onStart?: () => void;        // события при старте
    onComplete?: () => void;     // события при завершении
  };
  
export class WaveManager {
    waves: WaveConfig[];
    currentWaveIndex = 0;
    currentWaveCount = 0;
    spawner?: Spawner<Enemy>;
    onAllComplete?: () => void;
    isPaused: boolean = false;
    pauseTimer: number = 0;
  
    constructor(waves: WaveConfig[]) {
      this.waves = waves;
    }
  
    startNextWave(addEnemy: (e: Enemy) => void) {
      if (this.currentWaveIndex >= this.waves.length) {
        this.onAllComplete?.();
        return;
      }
  
      const wave = this.waves[this.currentWaveIndex];
      this.currentWaveCount = 0;
      wave.onStart?.();
  
      this.spawner = new Spawner(
        () => {
          const enemy = wave.createEnemy ? wave.createEnemy() : new Enemy(PIXI.Texture.WHITE);
          wave.behavior?.(enemy);
          return enemy;
        },
        wave.interval,
        true,
      );
  
      const wrappedAdd = (enemy: Enemy) => {
        addEnemy(enemy);
      
        // подписка на уничтожение
        enemy.events.on('destroy', () => {
            this.currentWaveCount++;
        
            if (this.currentWaveCount >= wave.count) {
              wave.onComplete?.();
              this.spawner = undefined;
        
              const pause = wave.pauseAfter ?? 0;
              if (pause > 0) {
                this.isPaused = true;
                this.pauseTimer = pause;
              } else {
                this.currentWaveIndex++;
              }
            }
          }) 
      };
      
  
      this.spawner.update = (dt, cb) => {
        if (this.currentWaveCount >= wave.count) return;
        Spawner.prototype.update.call(this.spawner, dt, (e: Enemy) => wrappedAdd(e));
      };
    }
  
    update(dt: number, addEnemy: (e: Enemy) => void) {
      if (this.isPaused) {
        this.pauseTimer -= dt;
        if (this.pauseTimer <= 0) {
          this.isPaused = false;
          this.pauseTimer = 0;
          this.currentWaveIndex++;
        } else {
          return;
        }
      }

      if (!this.spawner) {
        this.startNextWave(addEnemy);
        return;
      }
      this.spawner.update(dt, addEnemy);
    }
  }
  