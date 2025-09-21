import * as PIXI from "pixi.js";

type AssetsConfig = {
  textures: Record<string, string>;
  sounds: Record<string, string>;
};

export class LoadAssets {
  private static instance: LoadAssets;
  private config!: AssetsConfig;
  private loadedTextures: Record<string, PIXI.Spritesheet> = {};
  private loadedSounds: Record<string, HTMLAudioElement> = {};

  private constructor() {}

  public static getInstance(): LoadAssets {
    if (!LoadAssets.instance) {
      LoadAssets.instance = new LoadAssets();
    }
    return LoadAssets.instance;
  }

  // Загружаем конфиг ассетов
  public async init(config) {
    this.config = config;
  }

  // Загружаем все ресурсы
  public async loadAll(): Promise<void> {
    // Загружаем текстуры (спрайт-листы)
    for (const [key, path] of Object.entries(this.config.textures)) {
      const sheet = await PIXI.Assets.load<PIXI.Spritesheet>(path);
      this.loadedTextures[key] = sheet;
    }

    // Загружаем звуки
    for (const [key, path] of Object.entries(this.config.sounds)) {
      const audio = new Audio(path);
      this.loadedSounds[key] = audio;
    }
  }

  // Получить текстуру по имени
  public getTexture(sheetKey: string, frameName: string): PIXI.Texture {
    const sheet = this.loadedTextures[sheetKey];
    if (!sheet) throw new Error(`Texture sheet "${sheetKey}" not loaded`);
    const texture = sheet.textures[frameName];
    if (!texture) throw new Error(`Frame "${frameName}" not found in sheet "${sheetKey}"`);
    return texture;
  }

  // Получить анимацию (кадры)
  public getAnimation(sheetKey: string, animName: string): PIXI.Texture[] {
    const sheet = this.loadedTextures[sheetKey];
    if (!sheet) throw new Error(`Texture sheet "${sheetKey}" not loaded`);
    const anim = sheet.animations[animName];
    if (!anim) throw new Error(`Animation "${animName}" not found in sheet "${sheetKey}"`);
    return anim;
  }

  // Получить звук
  public getSound(key: string): HTMLAudioElement {
    const sound = this.loadedSounds[key];
    if (!sound) throw new Error(`Sound "${key}" not loaded`);
    return sound.cloneNode(true) as HTMLAudioElement; // копия, чтобы можно было воспроизводить параллельно
  }
}
