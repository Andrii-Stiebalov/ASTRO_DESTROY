export class Spawner<T> {
    spawnFunc: () => T;
    timer: number = 0;
    interval: number;
  
    constructor(spawnFunc: () => T, interval: number, isStartOnActive: boolean) {
      this.spawnFunc = spawnFunc;
      this.interval = interval;
      if(isStartOnActive) {
        this.timer = this.interval;
      }
    }
  
    update(dt: number, callback: (entity: T) => void) {
      this.timer += dt;
      if (this.timer >= this.interval) {
        const entity = this.spawnFunc();
        callback(entity);
        this.timer = 0;
      }
    }
  }