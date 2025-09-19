export class Input {
  private keys: Record<string, boolean> = {};
  private prevKeys: Record<string, boolean> = {};

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

  isPressed(key: string): boolean {
    return !!this.keys[key];
  }

  isJustPressed(key: string): boolean {
    return this.keys[key] && !this.prevKeys[key];
  }
}
