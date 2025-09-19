import { Container, Graphics } from 'pixi.js'
import type { Game } from './Game'
import { CollisionSystem } from './CollisionSystem';

export abstract class Scene {
  public container: Container
  protected game: Game
  collisionSystem: CollisionSystem;
  stars: {}[] = [];
  background: any;
  constructor (game: Game) {
    this.collisionSystem = new CollisionSystem();
    this.game = game;
    this.container = new Container();
  }

  drawStars() {
    const starGraphics = new Graphics();
    
    this.stars.forEach(star => {
      star.y += star.speed;
      if (star.y > this.game.app.view.height) {
        star.y = 0;
        star.x = Math.random() * this.game.app.view.width;
      }
      
      starGraphics.circle(star.x, star.y, star.size);
      starGraphics.fill({ color: 0xFFFFFF, alpha: Math.random() * 0.5 + 0.5 });
    });
    
    // Clear previous stars and add new ones
    if (this.container.children.includes(this.background)) {
      this.container.removeChild(this.background);
    }
    
    this.background = starGraphics;
    this.background.rect(0, 0, this.game.app.view.width, this.game.app.view.height);
    this.background.fill({ color: 0x050A30, alpha: 0.3 });
    
    this.container.addChildAt(this.background, 0);
    
    // Add subtle pulsing effect to title
  }

  public createStars(): void {
    // Generate random stars
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.game.app.view.width,
        y: Math.random() * this.game.app.view.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1
      });
    }
  }
  abstract update(dt: number): void
  destroy () {}
}
