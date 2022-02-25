let vs = `#version 300 es

in vec4 a_position;

void main() {
  gl_position = a_position;
}
`

let fs = `#version 300 es

out vec4 outColor;

void main() {
  outColor = vec4(1, 0, 1, 1);
}
`

function createShader() {
  
}

let canvas = document.createElement("canvas")
let webgl2 = canvas.getContext("webgl2")

