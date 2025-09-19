import { Application } from 'pixi.js'
import { Scene } from './Scene'
import { MenuScene } from '../scenes/MenuScene'
import { HUD } from '../core/HUD'

export class Game {
  public app: Application
  public hud!: HUD;
  private currentScene: Scene | null = null

  constructor () {
    this.app = new Application()
  }

  async init () {
    await this.app.init({
      width: 1280,
      height: 720,
      backgroundColor: 0x000000
    })
    
    // Создаём HUD с размерами экрана
    this.hud = new HUD(this.app.screen.width, this.app.screen.height);

    document.body.appendChild(this.app.canvas)

    this.changeScene(new MenuScene(this))
    this.app.ticker.add((dt) => this.update(dt.deltaTime))
  }

  changeScene (scene: Scene) {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene.container)
      this.currentScene.destroy()
    }
    this.currentScene = scene
    this.app.stage.addChild(scene.container)
    this.app.stage.addChild(this.hud.container)
  }

  update (dt: number) {
    if (this.currentScene) {
      this.currentScene.update(dt)
    }
  }
}
