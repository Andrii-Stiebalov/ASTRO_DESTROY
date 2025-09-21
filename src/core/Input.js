export class Input {
    keys = {};
    prevKeys = {};
    constructor() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
        });
        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });
    }
    update() {
        this.prevKeys = { ...this.keys };
    }
    isPressed(key) {
        return !!this.keys[key];
    }
    isJustPressed(key) {
        return this.keys[key] && !this.prevKeys[key];
    }
}
