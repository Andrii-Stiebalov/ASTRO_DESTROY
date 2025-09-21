import * as PIXI from "pixi.js";
import { Entity } from "./Entity";
import { LoadAssets } from "../core/LoadAssets";
export class Player extends Entity {
    health = 3;
    maxHealth = 3;
    shootCooldown = 0;
    animatedSprite;
    currentAnimation = 'idle_up';
    animations = new Map();
    isMoving = false;
    constructor(sheetKey, screenWidth = 800, screenHeight = 600) {
        // Загружаем первую текстуру для базового Entity
        const textures = LoadAssets.getInstance().getAnimation('spaceship_idle', "idle_up");
        const texture = PIXI.Texture.EMPTY;
        super(texture);
        // Создаём и настраиваем AnimatedSprite
        this.animatedSprite = new PIXI.AnimatedSprite(textures);
        this.animatedSprite.anchor.set(0.5);
        this.animatedSprite.animationSpeed = 0.2;
        this.animatedSprite.play();
        this.animatedSprite.width = 64;
        this.animatedSprite.height = 128;
        this.animatedSprite.anchor.set(0.5);
        this.x = screenWidth / 2;
        this.y = screenHeight * 0.9;
        // Предзагружаем все анимации
        this.loadAllAnimations();
        this.addChild(this.animatedSprite);
    }
    // Загрузка всех анимаций
    loadAllAnimations() {
        const animationStates = [
            'idle_up', 'idle_down', 'idle_left', 'idle_right',
            'move_up', 'move_down', 'move_left', 'move_right',
        ];
        animationStates.forEach(state => {
            const textures = LoadAssets.getInstance().getAnimation(`spaceship_${state.split('_')[0]}`, state);
            this.animations.set(state, textures);
        });
    }
    onTriggerCollision(other) {
        if (other instanceof Entity) {
            this.takeDamage();
        }
    }
    shoot() {
        if (this.shootCooldown <= 0) {
            this.shootCooldown = 20;
            // Проигрываем анимацию выстрела
            this.playAnim('shoot', false, () => {
                // После завершения возвращаемся к предыдущей анимации
                this.playAnim(this.currentAnimation);
            });
            // Эмитим событие стрельбы
            this.events.emit("shoot", this);
        }
    }
    update(input, screenWidth, screenHeight) {
        // Уменьшаем cooldown
        if (this.shootCooldown > 0)
            this.shootCooldown -= 1;
        // Определяем движение
        this.isMoving = false;
        let direction = null;
        if (input.isPressed("ArrowLeft")) {
            this.x -= 3;
            this.isMoving = true;
            direction = 'move_left';
        }
        else if (input.isPressed("ArrowRight")) {
            this.x += 3;
            this.isMoving = true;
            direction = 'move_right';
        }
        if (input.isPressed("ArrowUp")) {
            this.y -= 3;
            this.isMoving = true;
            direction = 'move_up';
        }
        else if (input.isPressed("ArrowDown")) {
            this.y += 3;
            this.isMoving = true;
            direction = 'move_down';
        }
        // Ограничиваем движение в пределах экрана
        // Обновляем анимацию в зависимости от движения
        if (this.isMoving && direction) {
            this.playAnim(direction);
            this.currentAnimation = direction;
        }
        else if (this.isMoving && !direction) {
            // Если направление не изменилось, но есть движение, продолжаем текущую анимацию
            this.playAnim(this.currentAnimation);
        }
        else {
            // Если не двигаемся, переключаемся на idle-анимацию
            const idleDirection = this.getCorrespondingIdleAnimation(this.currentAnimation);
            this.playAnim(idleDirection);
            this.currentAnimation = idleDirection;
        }
        // Стрельба
        if (input.isPressed("Space")) {
            this.shoot();
        }
    }
    // Универсальный метод для проигрывания анимаций
    playAnim(animationName, loop = true, onComplete) {
        const textures = this.animations.get(animationName);
        if (!textures || this.animatedSprite.textures === textures) {
            return;
        }
        this.animatedSprite.textures = textures;
        this.animatedSprite.loop = loop;
        this.animatedSprite.play();
        if (onComplete) {
            this.animatedSprite.onComplete = onComplete;
        }
    }
    takeDamage() {
        this.health -= 1;
        this.events.emit("damage", this.health);
        // Проигрываем анимацию получения урона
        this.playAnim('damage', false, () => {
            // После анимации урона возвращаемся к обычной анимации
            this.playAnim(this.currentAnimation);
        });
        if (this.health <= 0) {
            this.entityDestroy();
        }
    }
    // Вспомогательный метод для получения соответствующей idle-анимации
    getCorrespondingIdleAnimation(moveAnimation) {
        switch (moveAnimation) {
            case 'move_up':
            case 'idle_up':
                return 'idle_up';
            case 'move_down':
            case 'idle_down':
                return 'idle_down';
            case 'move_left':
            case 'idle_left':
                return 'idle_left';
            case 'move_right':
            case 'idle_right':
                return 'idle_right';
            default:
                return 'idle_up';
        }
    }
}
