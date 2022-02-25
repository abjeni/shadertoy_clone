let vertexShaderSource = `#version 300 es
precision highp float;
in vec4 a_position;

out vec2 color;

void main() {
  color = a_position.xy;
  gl_Position = a_position;
}
`

let fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 outColor;
uniform float slider;
in vec2 color;
void main() {
  outColor = vec4(color, slider, 1);
}
`

function createShader(gl, type, source) {

  var shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader

  console.log(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;

  console.log(gl.getProgramInfoLog(program));

  gl.deleteProgram(program);
}

let sliders;

window.onload = function() {
  let canvas = document.getElementById("canvas")
  document.onkeydown = (event) => {
    
    if (event.ctrlKey && event.code == "KeyS") {
      event.preventDefault();
      alert("Saving");
    }
  }

  sliders = [document.getElementById("slider-1")];
  
  let gl = canvas.getContext("webgl2")
  if (!gl) {
    alert("Sorry, you need web gl 2");
    return
  }

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader);

  var positionAttributelocation = gl.getAttribLocation(program, "a_position")
  console.log(positionAttributelocation)
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var positions = [
    -1, -1,
    -1, +1,
    +1, +1,
    -1, -1,
    +1, -1,
    +1, +1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  var vao = gl.createVertexArray();

  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributelocation);
  
  var size = 2;
  var type = gl.FLOAT;
  var normalize = false;
  var stride = 0;
  var offset = 0;
  gl.vertexAttribPointer(positionAttributelocation, size, type, normalize, stride, offset);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  gl.bindVertexArray(vao);


  
  requestAnimationFrame((time) => render(gl, program, time));
  
}

function render(gl, program, time) {

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  var slider1Value = new Number(sliders[0].value)
  var sliderUniformLocation = gl.getUniformLocation(program, "slider");
  gl.uniform1f(sliderUniformLocation, slider1Value);
  gl.drawArrays(primitiveType, offset, count);
  requestAnimationFrame((time) => render(gl, program, time));
}

