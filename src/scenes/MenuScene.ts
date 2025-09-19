import { Container, Graphics, Text, TextStyle, Sprite } from 'pixi.js';
import { Scene } from '../core/Scene';
import type { Game } from '../core/Game';
import { Level1Scene } from './Level1Scene';

export class MenuScene extends Scene {
  private title: Text;
  private playButton: Container;
  private background: Graphics;
  private stars: Array<{ x: number; y: number; size: number; speed: number }> = [];
  
  constructor(game: Game) {
    super(game);
    this.setupBackground();
    this.createStars();
    this.createTitle();
    this.createPlayButton();
    this.createCredits();
  }

  private setupBackground(): void {
    // Create dark space background
    this.background = new Graphics();
    this.background.rect(0, 0, this.game.app.view.width, this.game.app.view.height);
    this.background.fill({ color: 0x050A30 });
    this.container.addChild(this.background);
  }


  private createTitle(): void {
    // Main title with gradient effect
    const titleStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 64,
      fontWeight: 'bold',
      fill: 0x4fc3f7, // Gradient, use number for second color
      stroke: 0x01579b,
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: 0x000000,
      dropShadowBlur: 8,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 4,
      letterSpacing: 2
    });

    this.title = new Text({
      text: '🚀 SPACE SHOOTER',
      style: titleStyle
    });
    
    this.title.anchor.set(0.5);
    this.title.position.set(
      this.game.app.view.width / 2, 
      this.game.app.view.height * 0.25
    );
    
    this.container.addChild(this.title);
  }

  private createPlayButton(): void {
    // Create button container
    this.playButton = new Container();
    this.playButton.position.set(
      this.game.app.view.width / 2,
      this.game.app.view.height * 0.6
    );
    
    // Button background
    const buttonBg = new Graphics();
    buttonBg.roundRect(-100, -25, 200, 50, 15);
    buttonBg.fill({ color: 0x1E88E5 });
    
    // Button text
    const buttonText = new Text({
      text: 'PLAY NOW',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xFFFFFF,
        letterSpacing: 1
      })
    });
    buttonText.anchor.set(0.5);
    
    // Add hover effect
    this.playButton.eventMode = 'static';
    this.playButton.cursor = 'pointer';
    
    this.playButton.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.roundRect(-100, -25, 200, 50, 15);
      buttonBg.fill({ color: 0x42A5F5 });
      buttonText.style.fill = 0xE3F2FD;
    });
    
    this.playButton.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.roundRect(-100, -25, 200, 50, 15);
      buttonBg.fill({ color: 0x1E88E5 });
      buttonText.style.fill = 0xFFFFFF;
    });
    
    this.playButton.on('pointerdown', () => {
      this.game.changeScene(new Level1Scene(this.game));
    });
    
    this.playButton.addChild(buttonBg, buttonText);
    this.container.addChild(this.playButton);
  }

  private createCredits(): void {
    // Credits text
    const creditsStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fill: 0x90CAF9,
      align: 'center'
    });
    
    const credits = new Text({
      text: 'Use arrow keys to move • Spacebar to shoot\nCollect power-ups and avoid enemy fire!',
      style: creditsStyle
    });
    
    credits.anchor.set(0.5);
    credits.position.set(
      this.game.app.view.width / 2,
      this.game.app.view.height * 0.8
    );
    
    this.container.addChild(credits);
  }



  update(): void {
    this.drawStars();
    // Animate stars for parallax effect
  }
}
