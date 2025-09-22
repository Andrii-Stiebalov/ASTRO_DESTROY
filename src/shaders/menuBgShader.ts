export const fragment = `
#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
out vec4 fragColor;

// Простая функция шума
float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    // Нормализуем координаты и центрируем
    vec2 uv = (gl_FragCoord.xy / u_resolution.xy - 1.) * 2.0;
    uv.x *= u_resolution.x / u_resolution.y;

    // Полярные координаты
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);

    // Движение по тоннелю
    float speed = u_time * 1.0;
    float tunnel = 2.0 / (radius + 0.5) + speed * 0.5;

    // ЧБ полосы - комикс стиль
    float lines = step(0.6, fract(tunnel + sin(angle * 5.0) * 0.1));

    // Виньетка по радиусу
    float vignette = smoothstep(2., 0.1, radius);

    // Тень и глубина
    float depth = exp(-radius * 5.0); // чем дальше, тем темнее
    float shadow = depth * 0.5 + 0.5;

    // Лёгкий дым/туман
    float fog = noise(uv * 3.0 + u_time * 0.5) * 0.2;

    // Финальный цвет с комбинированием эффектов
    float color = lines * shadow * vignette + fog;

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

`;
