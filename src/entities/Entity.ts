import * as PIXI from "pixi.js";
import { EventEmitter } from "../core/EventEmitter";

interface EntityOptions {
    texture: PIXI.Texture;
    onBeforeDestroyHandler?: () => {};
}

export abstract class Entity extends PIXI.Sprite {
  public events: EventEmitter;
  onBeforeDestroyHandler?: () =>{};

  constructor(texture) {
    super(texture);
    this.events = new EventEmitter();
    this.anchor.set(0.5);
    // this.onBeforeDestroyHandler = options.onBeforeDestroyHandler;
  }

  abstract update(dt: number): void;

  entityDestroy() {
    this.events.emit("destroy", this);
  }

  kill() {
    this.entityDestroy();
  }

  onTriggerCollision(other: Entity) {
    
  }

  onKill() {
    this.events.emit("kill", this);
  }

  triggerCollision(other: Entity) {
    this.events.emit("collision", this, other);
    this.onTriggerCollision(other);
  }
}
