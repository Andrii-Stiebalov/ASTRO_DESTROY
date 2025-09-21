export const fragment = `
#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_player;
uniform float u_time;
out vec4 fragColor;

// Псевдо-случайная функция
float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

// Функция для генерации иероглифоподобных символов
float glyph(vec2 uv, float scale) {
    vec2 grid = fract(uv * scale);
    vec2 cell = floor(uv * scale);
    
    // Уникальный паттерн для каждой ячейки
    float pattern = rand(cell);
    
    // Создаем различные иероглифы
    if (pattern < 0.2) {
        return step(0.3, max(abs(grid.x - 0.5), abs(grid.y - 0.5)));
    } else if (pattern < 0.4) {
        return step(0.4, distance(grid, vec2(0.5)));
    } else if (pattern < 0.6) {
        return step(0.35, abs(grid.x - grid.y));
    } else if (pattern < 0.8) {
        return step(0.35, abs((1.0 - grid.x) - grid.y));
    } else {
        return step(0.25, min(grid.x, grid.y));
    }
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
    vec2 center = (u_player - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
    
    // Смещение UV относительно центра игрока
    vec2 pos = uv - center;
    float dist = length(pos);
    float angle = atan(pos.y, pos.x);
    
    // Спиральные координаты
    float spiral = log(dist) * 2.0 + angle * 0.5 + u_time * 2.0;
    float spiralMask = fract(spiral * 0.5);
    
    // Эффект перспективы и глубины
    float depth = 1.0 - smoothstep(0.0, 1.5, dist);
    float perspective = 1.0 / (dist + 0.5);
    
    // Фрактальные итерации
    float fractal = 0.0;
    vec2 fractalUV = pos * (5.0 + 3.0 * sin(u_time * 0.5));
    for (int i = 0; i < 4; i++) {
        fractal += glyph(fractalUV, 1.0 + float(i) * 3.0) * (0.7 - float(i) * 0.2);
        fractalUV = fractalUV * 1.8 + vec2(sin(u_time * 0.3), cos(u_time * 0.2));
    }
    
    // Создаем спиральную маску
    float spiralPattern = step(0.3, spiralMask) * step(spiralMask, 0.7);
    
    // Комбинируем эффекты
    float finalEffect = fractal * spiralPattern * perspective * depth;
    finalEffect *= 1.0 + 0.3 * sin(u_time * 5.0 - dist * 10.0); // Добавляем пульсацию
    
    // Эффект засасывания (втягивания к центру)
    float suction = smoothstep(0.8, 0.0, dist) * (0.5 + 0.5 * sin(u_time * 3.0 - dist * 8.0));
    
    // Финальный цвет (черно-белый)
    float color = clamp(finalEffect + suction, 0.0, 1.0);
    
    fragColor = vec4(vec3(color), 1.0);
}
 `;
    export const vertex = `
#version 300 es

in vec2 aVertexPosition;
in vec2 aUV;

out vec2 vUV;

void main() {
    vUV = aUV;
    gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}

`
    