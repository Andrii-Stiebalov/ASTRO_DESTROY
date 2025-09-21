import { Application } from "pixi.js";
import { MenuScene } from "../scenes/MenuScene";
import { HUD } from "../core/HUD";
import { LoadAssets } from "./LoadAssets";
import assetsConfig from "../configs/assets.json";
export class Game {
    app;
    hud;
    currentScene = null;
    loader;
    constructor() {
        this.app = new Application();
        // теперь используем singleton
        this.loader = LoadAssets.getInstance();
    }
    async init() {
        // инициализация Pixi
        await this.app.init({
            width: 1280,
            height: 720,
            backgroundColor: 0x000000,
            preference: 'webgl',
        });
        // сначала читаем конфиг ассетов
        await this.loader.init(assetsConfig);
        // затем загружаем все ассеты (можно с прогрессом)
        await this.loader.loadAll();
        // создаём HUD после загрузки
        this.hud = new HUD(this.app.screen.width, this.app.screen.height);
        // добавляем canvas на страницу
        document.body.appendChild(this.app.canvas);
        // стартовая сцена
        this.changeScene(new MenuScene(this));
        // игровой цикл
        this.app.ticker.add((dt) => this.update(dt.deltaTime));
    }
    changeScene(scene) {
        if (this.currentScene) {
            this.app.stage.removeChild(this.currentScene.container);
            this.currentScene.destroy();
        }
        this.currentScene = scene;
        this.app.stage.addChild(scene.container);
        this.app.stage.addChild(this.hud.container);
    }
    update(dt) {
        if (this.currentScene) {
            this.currentScene.update(dt);
        }
    }
}
