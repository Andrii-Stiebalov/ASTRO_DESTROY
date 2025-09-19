// vertex
// vertex
export const starVertex = `
in vec2 aPosition;
in vec4 aColor;

uniform mat3 projectionMatrix;

out vec2 vUv;

void main(void){
  // Создаем UV из позиции (предполагаем, что позиции от -1 до 1)
  vUv = (aPosition + 1.0) / 2.0;
  
  gl_Position = vec4((projectionMatrix * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
}
`;

// Простой тестовый шейдер
export const starFragment = `
precision mediump float;

in vec2 vUv;
uniform float u_time;

void main() {
  vec2 uv = vUv;
  vec3 color = vec3(0.2 + 0.1 * sin(u_time), 0.1, 0.3 + 0.1 * cos(u_time));
  color += vec3(0.5 * sin(uv.x * 50.0 + u_time), 0.5 * cos(uv.y * 50.0 + u_time), 0.5);
  
  gl_FragColor = vec4(color, 1.0);
}`