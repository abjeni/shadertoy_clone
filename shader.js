let vertexShaderSource = `#version 300 es
precision highp float;
in vec4 a_position;

out vec2 color;

void main() {
  color = a_position.xy;
  gl_Position = a_position;
}
`

let defaultFragmentShaderSource = `#version 300 es
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

function shaderSaved(gl, shader) {
  gl.deleteProgram(shader.program);
  gl.deleteShader(shader.vertex)
  gl.deleteShader(shader.fragment);

  createProgramFromShaderStrings(gl, vertexShaderSource, document.getElementById("editor").value, shader);
}



window.onload = function() {
  let canvas = document.getElementById("canvas")

  let textarea = document.getElementById("editor");
  textarea.textContent = defaultFragmentShaderSource;
  sliders = [document.getElementById("slider-1")];
  
  let gl = canvas.getContext("webgl2")
  if (!gl) {
    alert("Sorry, you need web gl 2");
    return
  }
  var shader = {}
  createProgramFromShaderStrings(gl, vertexShaderSource, defaultFragmentShaderSource, shader);



  
  requestAnimationFrame((time) => render(gl, shader, time));


  document.onkeydown = (event) => {
    
    if (event.ctrlKey && event.code == "KeyS") {
      event.preventDefault();
      console.log(shader)
      shaderSaved(gl, shader);
    }
  }

  document.getElementById("run-button").onclick = () => shaderSaved(gl, shader);
  

}

function createProgramFromShaderStrings(gl, vertexShaderSource, fragmentShaderSource, shader) {
  shader.vertex = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  shader.fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  shader.program = createProgram(gl, shader.vertex, shader.fragment);
}

function render(gl, shader, time) {

  var positionAttributelocation = gl.getAttribLocation(shader.program, "a_position")
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

  gl.useProgram(shader.program);

  gl.bindVertexArray(vao);
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  var slider1Value = new Number(sliders[0].value)
  var sliderUniformLocation = gl.getUniformLocation(shader.program, "slider");
  gl.uniform1f(sliderUniformLocation, slider1Value);
  gl.drawArrays(primitiveType, offset, count);
  requestAnimationFrame((time) => render(gl, shader, time));
}

