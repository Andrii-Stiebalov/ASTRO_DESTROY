export class CollisionSystem {
    // Проверка AABB коллизии
    checkCollisions(entities) {
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const a = entities[i];
                const b = entities[j];
                if (this.isIntersecting(a, b)) {
                    a.triggerCollision(b);
                    b.triggerCollision(a);
                }
            }
        }
    }
    isIntersecting(a, b) {
        return (Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
            Math.abs(a.y - b.y) < (a.height + b.height) / 2);
    }
}
