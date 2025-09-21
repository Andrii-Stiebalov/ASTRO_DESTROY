import * as PIXI from "pixi.js";
import { gsap } from "gsap";
export class HUD {
    container;
    messageText;
    hpBarBg;
    hpBarFill;
    bossHpBg;
    bossHpFill;
    messageTimer = 0;
    isMessageVisible = false;
    screenWidth = 800;
    screenHeight = 600;
    constructor(screenWidth = 800, screenHeight = 600) {
        this.container = new PIXI.Container();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        // Сообщение по центру экрана в моноширинном стиле
        this.messageText = new PIXI.Text("", {
            fill: 0xffffff,
            fontSize: 62,
            fontWeight: "bold",
            fontFamily: "monospace",
            stroke: 0x000000,
            strokeThickness: 4
        });
        this.messageText.anchor.set(0.5);
        this.messageText.x = this.screenWidth / 2;
        this.messageText.y = this.screenHeight / 2;
        this.messageText.visible = false;
        // Полоса HP игрока - черно-белый стиль
        this.hpBarBg = new PIXI.Graphics();
        this.hpBarFill = new PIXI.Graphics();
        this.hpBarBg.y = this.screenHeight * 0.96;
        this.hpBarFill.y = this.screenHeight * 0.96;
        this.drawHpBar(1);
        // Полоса HP босса - черно-белый стиль
        this.bossHpBg = new PIXI.Graphics();
        this.bossHpFill = new PIXI.Graphics();
        this.bossHpBg.y = 15;
        this.bossHpFill.y = 15;
        this.setBossHealth(0, 1);
        this.container.addChild(this.messageText, this.hpBarBg, this.hpBarFill, this.bossHpBg, this.bossHpFill);
        this.drawBossHpBar(1);
    }
    showMessage(text, duration = 100) {
        this.messageText.text = text;
        this.messageText.alpha = 0;
        this.messageText.visible = true;
        this.messageTimer = duration;
        this.isMessageVisible = true;
        // GSAP анимация появления сообщения
        gsap.to(this.messageText, {
            alpha: 1,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
                // Анимация исчезновения по таймеру
                setTimeout(() => {
                    this.hideMessage();
                }, duration);
            }
        });
    }
    hideMessage() {
        gsap.to(this.messageText, {
            alpha: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                this.messageText.visible = false;
                this.isMessageVisible = false;
            }
        });
    }
    update(dt) {
        if (this.isMessageVisible) {
            this.messageTimer -= dt;
            if (this.messageTimer <= 0 && this.messageText.alpha === 1) {
                this.hideMessage();
            }
        }
    }
    setPlayerHealth(current, max) {
        console.log(current, max);
        const ratio = Math.max(0, Math.min(1, current / max));
        this.animateHpBar(ratio);
    }
    animateHpBar(targetRatio) {
        // Анимация изменения полосы здоровья
        gsap.to(this.hpBarFill, {
            width: 200 * targetRatio,
            duration: 0.3,
            ease: "power2.out",
            //   onUpdate: () => {
            //     this.hpBarFill.clear();
            //     this.hpBarFill.beginFill(0xffffff); // Белый цвет
            //     this.hpBarFill.endFill();
            //   }
        });
    }
    drawHpBar(ratio) {
        const width = 200;
        const height = 12;
        const x = this.screenWidth * 0.5 - width * 0.5;
        this.hpBarBg.clear();
        this.hpBarBg.beginFill(0x000000); // Черный фон
        this.hpBarBg.lineStyle(2, 0xffffff); // Белая обводка
        this.hpBarBg.drawRect(x, 0, width, height);
        this.hpBarBg.endFill();
        this.hpBarFill.clear();
        this.hpBarFill.beginFill(0xffffff); // Белый заполнитель
        this.hpBarFill.drawRect(x, 0, width * ratio, height);
        this.hpBarFill.endFill();
    }
    setBossHealth(current, max) {
        const ratio = Math.max(0, Math.min(1, max > 0 ? current / max : 0));
        this.animateBossHpBar(ratio);
        const visible = max > 0 && current > 0;
        if (visible && !this.bossHpBg.visible) {
            this.showBossHealthBar();
        }
        else if (!visible && this.bossHpBg.visible) {
            this.hideBossHealthBar();
        }
    }
    showBossHealthBar() {
        this.bossHpBg.visible = true;
        this.bossHpFill.visible = true;
        // Анимация появления полосы босса
        gsap.fromTo([this.bossHpBg, this.bossHpFill], { alpha: 0, y: 15 }, { alpha: 1, y: 15, duration: 0.5, ease: "back.out" });
    }
    hideBossHealthBar() {
        // Анимация исчезновения полосы босса
        gsap.to([this.bossHpBg, this.bossHpFill], {
            alpha: 0,
            y: 100,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                this.bossHpBg.visible = false;
                this.bossHpFill.visible = false;
            }
        });
    }
    animateBossHpBar(targetRatio) {
        // Анимация изменения полосы здоровья босса
        gsap.to(this.bossHpFill, {
            width: 400 * targetRatio,
            duration: 0.4,
            ease: "power2.out",
            onUpdate: () => {
                this.bossHpFill.clear();
                this.bossHpFill.beginFill(0xffffff); // Белый цвет
                this.bossHpFill.drawRect(this.screenWidth * 0.5 - 200, 0, this.bossHpFill.width, 16);
                this.bossHpFill.endFill();
            }
        });
    }
    drawBossHpBar(ratio) {
        const width = 400;
        const height = 16;
        const x = this.screenWidth * 0.5 - width / 2;
        this.bossHpBg.clear();
        this.bossHpBg.beginFill(0x000000); // Черный фон
        this.bossHpBg.lineStyle(2, 0xffffff); // Белая обводка
        this.bossHpBg.drawRect(x, 0, width, height);
        this.bossHpBg.endFill();
        this.bossHpFill.clear();
        this.bossHpFill.beginFill(0xffffff); // Белый заполнитель
        this.bossHpFill.drawRect(x, 0, width * ratio, height);
        this.bossHpFill.endFill();
    }
    // Дополнительный метод для анимации повреждения
    flashDamage() {
        gsap.to(this.hpBarFill, {
            alpha: 0.3,
            duration: 0.1,
            yoyo: true,
            repeat: 2,
            ease: "power1.inOut"
        });
    }
    // Анимация для критического уровня здоровья
    pulseLowHealth(isLow) {
        if (isLow) {
            gsap.to(this.hpBarFill, {
                alpha: 0.7,
                duration: 0.5,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
        }
        else {
            gsap.killTweensOf(this.hpBarFill);
            this.hpBarFill.alpha = 1;
        }
    }
}
