import * as PIXI from "pixi.js";
import { EventEmitter } from "../core/EventEmitter";
export class Entity extends PIXI.Sprite {
    events;
    onBeforeDestroyHandler;
    constructor(texture) {
        super(texture);
        this.events = new EventEmitter();
        this.anchor.set(0.5);
        // this.onBeforeDestroyHandler = options.onBeforeDestroyHandler;
    }
    entityDestroy() {
        this.events.emit("destroy", this);
    }
    kill() {
        this.entityDestroy();
    }
    onTriggerCollision(other) {
    }
    onKill() {
        this.events.emit("kill", this);
    }
    triggerCollision(other) {
        this.events.emit("collision", this, other);
        this.onTriggerCollision(other);
    }
}
