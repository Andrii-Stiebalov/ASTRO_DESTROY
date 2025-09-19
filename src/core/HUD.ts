import * as PIXI from "pixi.js";

export class HUD {
  public container: PIXI.Container;
  private messageText: PIXI.Text;
  private hpBarBg: PIXI.Graphics;
  private hpBarFill: PIXI.Graphics;
  private bossHpBg: PIXI.Graphics;
  private bossHpFill: PIXI.Graphics;

  private messageTimer: number = 0; // сколько ещё показывать сообщение
  private isMessageVisible: boolean = false;
  private screenWidth: number = 800;
  private screenHeight: number = 600;

  constructor(screenWidth: number = 800, screenHeight: number = 600) {
    this.container = new PIXI.Container();
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    // this.scoreText = new PIXI.Text("left to kill: 10", { fill: 0xffffff });
    // this.livesText = new PIXI.Text("Lives: 3", { fill: 0xffffff });

    // this.livesText.y = 30;

    // Сообщение по центру экрана
    this.messageText = new PIXI.Text("", {
      fill: 0xffff00,
      fontSize: 32,
      fontWeight: "bold",
    });

    this.messageText.anchor.set(0.5);
    this.messageText.x = this.screenWidth / 2;
    this.messageText.y = this.screenHeight / 2;
    this.messageText.visible = false;

    // Полоса HP игрока
    this.hpBarBg = new PIXI.Graphics();
    this.hpBarFill = new PIXI.Graphics();
    this.hpBarBg.y = this.screenHeight * 0.96; // 10% от высоты экрана
    this.hpBarFill.y = this.screenHeight * 0.96;

    this.drawHpBar(1); // по умолчанию 100%

    // Полоса HP босса (вверху по центру)
    this.bossHpBg = new PIXI.Graphics();
    this.bossHpFill = new PIXI.Graphics();
    this.bossHpBg.y = this.screenHeight * 0.02; // 2% от высоты экрана
    this.bossHpBg.y = this.screenHeight * 0
    this.bossHpFill.y = this.screenHeight * 0.02;
    this.setBossHealth(0, 1); // скрыть изначально

    this.container.addChild(
      this.messageText,
      this.hpBarBg,
      this.hpBarFill,
      this.bossHpBg,
      this.bossHpFill
    );
  }

  showMessage(text: string, duration: number = 100) {
    this.messageText.text = text;
    this.messageText.visible = true;
    this.messageTimer = duration;
    this.isMessageVisible = true;
  }

  update(dt: number) {
    if (this.isMessageVisible) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) {
        this.messageText.visible = false;
        this.isMessageVisible = false;
      }
    }
  }

  setPlayerHealth(current: number, max: number) {
    const ratio = Math.max(0, Math.min(1, current / max));
    this.drawHpBar(ratio);
  }

  private drawHpBar(ratio: number) {
    const width = 200;
    const height = 12;
    const x = this.screenWidth * 0.5 - width * 0.5;

    this.hpBarBg.clear();
    this.hpBarBg.beginFill(0x333333);
    this.hpBarBg.drawRect(x, 0, width, height);
    this.hpBarBg.endFill();

    this.hpBarFill.clear();
    this.hpBarFill.beginFill(0x00ff66);
    this.hpBarFill.drawRect(x, 0, width * ratio, height);
    this.hpBarFill.endFill();
  }

  setBossHealth(current: number, max: number) {
    const ratio = Math.max(0, Math.min(1, max > 0 ? current / max : 0));
    this.drawBossHpBar(ratio);
    const visible = max > 0 && current > 0;
    this.bossHpBg.visible = visible;
    this.bossHpFill.visible = visible;
  }

  private drawBossHpBar(ratio: number) {
    const width = 400;
    const height = 16;
    const x = this.screenWidth * 0.5 - width * 0.5;

    this.bossHpBg.clear();
    this.bossHpBg.beginFill(0x222222);
    this.bossHpBg.drawRect(x, 0, width, height);
    this.bossHpBg.endFill();

    this.bossHpFill.clear();
    this.bossHpFill.beginFill(0xff3366);
    this.bossHpFill.drawRect(x, 0, width * ratio, height);
    this.bossHpFill.endFill();
  }
}
