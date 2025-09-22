import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Scene } from '../core/Scene';
import type { Game } from '../core/Game';
import { Level1Scene } from './Level1Scene';
import { fragment, vertex } from '../shaders/MenuBgShader';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';

export class MenuScene extends Scene {
  private title: Text;
  private playButton: Container;
  private background: Graphics;
  private gridLines: Graphics;
  private particles: Array<{ x: number; y: number; size: number; speed: number; alpha: number }> = [];
  
  constructor(game: Game) {
    super(game);
    this.setupBackground();
    this.createGrid();
    this.createParticles();
    this.createTitle();
    this.createPlayButton();
    this.createCredits();
    this.addShader();
  }

  private setupBackground(): void {
    // Черный фон

  }

  private createGrid(): void {
    // Сетка из белых линий
    this.gridLines = new Graphics();
    const width = this.game.app.view.width;
    const height = this.game.app.view.height;
    const gridSize = 40;

    this.gridLines.stroke({ color: 0x222222, width: 1 });

    // Вертикальные линии
    for (let x = 0; x <= width; x += gridSize) {
      this.gridLines.moveTo(x, 0);
      this.gridLines.lineTo(x, height);
    }

    // Горизонтальные линии
    for (let y = 0; y <= height; y += gridSize) {
      this.gridLines.moveTo(0, y);
      this.gridLines.lineTo(width, y);
    }

    this.container.addChild(this.gridLines);
  }

  private createParticles(): void {
    // Создаем частицы для фона
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.game.app.view.width,
        y: Math.random() * this.game.app.view.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1,
        alpha: Math.random() * 0.5 + 0.3
      });
    }
  }



  private createTitle(): void {
    // Главный заголовок в моноширинном стиле
    const titleStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 2,
      letterSpacing: 4
    });

    this.title = new Text({
      text: 'ALT PODOL',
      style: titleStyle
    });
    
    this.title.anchor.set(0.5);
    this.title.position.set(
      this.game.app.view.width / 2, 
      this.game.app.view.height * 0.2
    );
    
    this.container.addChild(this.title);

    // Подзаголовок
    const subtitleStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 16,
      fill: 0x888888,
      letterSpacing: 2
    });

    const subtitle = new Text({
      text: '知者不言，言者不知',
      style: subtitleStyle
    });
    
    subtitle.anchor.set(0.5);
    subtitle.position.set(
      this.game.app.view.width / 2, 
      this.game.app.view.height * 0.2 + 60
    );
    
    this.container.addChild(subtitle);
  }

  private createPlayButton(): void {
    this.playButton = new Container();
    this.playButton.position.set(
      this.game.app.view.width / 2,
      this.game.app.view.height * 0.46
    );
  
    // Shadow
    const buttonShadow = new Graphics()
      .roundRect(-80, 8, 160, 60, 10)
      .fill({ color: 0x333333 });
  
    // Main button
    const buttonMain = new Graphics()
      .roundRect(-80, 0, 160, 60, 10)
      .fill({ color: 0xffffff })
      .stroke({ color: 0x000000, width: 2 });
  
    // Text
    const buttonText = new Text({
      text: "START",
      style: new TextStyle({
        fontFamily: "monospace",
        fontSize: 20,
        fontWeight: "bold",
        fill: 0x000000,
        letterSpacing: 2,
      }),
    });
    buttonText.anchor.set(0.5);
    buttonText.position.set(0, 28);
  
    this.playButton.addChild(buttonShadow, buttonMain, buttonText);
  
    // Interactivity
    this.playButton.eventMode = "static";
    this.playButton.cursor = "pointer";
  
    // Hover effect
    this.playButton.on("pointerover", () => {
      gsap.to(buttonMain, {
        y: -4,
        duration: 0.2,
        ease: "power2.out",
      });
      gsap.to(buttonText, {
        y: 23,
        duration: 0.2,
        ease: "power2.out",
      });
      gsap.to(buttonShadow, {
        y: -4,
        duration: 0.2,
        ease: "power2.out",
      });
    });
  
    this.playButton.on("pointerout", () => {
      gsap.to(buttonMain, {
        y: 0,
        duration: 0.2,
        ease: "power2.inOut",
      });
      gsap.to(buttonText, {
        y: 28,
        duration: 0.2,
        ease: "power2.inOut",
      });
      gsap.to(buttonShadow, {
        y: 0,
        duration: 0.2,
        ease: "power2.inOut",
      });
    });
  
    this.playButton.on("pointerdown", () => {
      gsap.to(buttonMain, {
        y: 4,
        duration: 0.1,
        ease: "power1.inOut",
        onComplete: () => {
          setTimeout(() => {
            this.game.changeScene(new Level1Scene(this.game));
          }, 150);
        },
      });
      gsap.to(buttonText, {
        y: 32,
        duration: 0.1,
        ease: "power1.inOut",
      });
      gsap.to(buttonShadow, {
        y: 2,
        duration: 0.1,
        ease: "power1.inOut",
      });
    });
  
    this.container.addChild(this.playButton);
  }

  private createCredits(): void {
    // Инструкции в моноширинном стиле
    const creditsStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 12,
      fill: 0x666666,
      align: 'center'
    });
    
    const credits = new Text({
      text: '[ARROWS] MOVE  [SPACE] SHOOT  [ESC] MENU\nPOWER-UPS ENHANCE YOUR TERMINAL',
      style: creditsStyle
    });
    
    credits.anchor.set(0.5);
    credits.position.set(
      this.game.app.view.width / 2,
      this.game.app.view.height * 0.8
    );
    
    this.container.addChild(credits);

    // Версия игры
    const versionStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 10,
      fill: 0x444444
    });

    const version = new Text({
      text: 'v1.0.0 // TERMINAL_OS',
      style: versionStyle
    });

    version.position.set(20, this.game.app.view.height - 30);
    this.container.addChild(version);
  }

  addShader() {
    this.shader = PIXI.Filter.from({
        gl: {
            vertex,
            fragment,
          },
          resources: {
            shaderToyUniforms: {
                u_resolution: { value: [640, 360, 1], type: 'vec2<f32>' },

              u_time: { value: 0, type: 'f32' },
              u_player: { value: [640, 360], type: 'vec2<f32>' },
            },
          },
    });

    const quadGeometry = new PIXI.Geometry();
    quadGeometry.addAttribute("aVertexPosition", [
      -1, -1,
       1, -1,
       1,  1,
      -1,  1,
    ], 2);

    quadGeometry.addAttribute("aUV", [
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    ], 2);


    quadGeometry.addIndex([0, 1, 2, 0, 2, 3]);
      const quad = new PIXI.Mesh({
        geometry: quadGeometry,
        shader: this.shader,
      });
    
      quad.width = this.screenWidth;
      quad.height = this.screenHeight;
      quad.x = this.screenWidth / 2;
      quad.y = this.screenHeight / 2;
      quad.zIndex = 0;
      this.game.app.stage.addChild(quad);
  }

  update(): void {
    // Очищаем старые частицы
    this.shader.resources.shaderToyUniforms.uniforms.u_time += 0.005;
    
    // Рисуем новые частицы
  }
}