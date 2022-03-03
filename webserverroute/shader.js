
//global variables
let shaderUpdated = true;

let vertexShaderSource = `#version 300 es
precision highp float;
in vec4 a_position;

out vec2 color;

void main() {
  color = a_position.xy;
  gl_Position = a_position;
}
`;

var elements = {
  canvas: undefined, editor: undefined,
  sliders: undefined, logArea: undefined
};

// end of global variables

function resize(canvas) { // this doesn't work, window inndeWidth and innerHeight is not the canvas size
  var displayWidth  = window.innerWidth;
  var displayHeight = window.innerHeight;

  if (canvas.width  !== displayWidth ||
      canvas.height !== displayHeight) {

      canvas.width  = displayWidth;
      canvas.height = displayHeight;
  }
}

function clearErrors() {
  elements.logArea.textContent = "";
  elements.editor.getSession().clearAnnotations();
}

function createShader(gl, type, source) {

  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    clearErrors();
    return shader;
  }

  displayError(gl.getShaderInfoLog(shader));

  gl.deleteShader(shader);
  return false
}

function displayError(errorLogLines) {
  
  elements.logArea.textContent = errorLogLines;

  var splittedError = errorLogLines.split(":").map(x => x.trim());

  if (splittedError.length >= 5) {
    var [type, column, row, codeWithError, message] = splittedError;

    elements.editor.getSession().setAnnotations([{
      row: Number(row) - 1,
      column: Number(column),
      text: `${codeWithError} : ${message}`, // Or the Json reply from the parser 
      type: type.toLowerCase() // also "warning" and "information"
    }]);
  }
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    shaderUpdated = true;
    return program;
  }

  logArea.textContent = gl.getProgramInfoLog(program);

  gl.deleteProgram(program);
}

function shaderSaved(gl, shader) {
  gl.deleteProgram(shader.program);
  gl.deleteShader(shader.vertex);
  gl.deleteShader(shader.fragment);

  createProgramFromShaderStrings(gl, vertexShaderSource, elements.editor.getValue(), shader);
}

function createProgramFromShaderStrings(gl, vertexShaderSource, fragmentShaderSource, shader) {
  shader.vertex = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  shader.fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (shader.vertex && shader.fragment)
    shader.program = createProgram(gl, shader.vertex, shader.fragment);
}

function getShaderSourceById(id) {
  let formData = new FormData();
  formData.append('id', id);

  let myInit = {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
    mode: 'cors',
    cache: 'default'
  };

  let myRequest = new Request("getShaderById.php",myInit);

  fetch(myRequest).then(function(response) {
    response.text().then(main)
  })
}

function saveShaderSourceById(id, source) {
  let formData = new FormData();
  formData.append('id', id);
  formData.append('source', source);

  let myInit = {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
    mode: 'cors',
    cache: 'default'
  };

  let myRequest = new Request("saveShader.php",myInit);

  fetch(myRequest).then(function(response) {
    response.text().then((text) => console.log(text));
  })
}

function saveShader() {
  let paramString = window.location.search;
  let queryString = new URLSearchParams(paramString);
  let source = elements.editor.getValue();
  let id = parseInt(queryString.get("id"));
  if (isNaN(id)) return;
  if (id == 3) return; //won't allow default shader saving for nows
  saveShaderSourceById(id, source);
}

function getShaderSource() {
  let paramString = window.location.search;
  let queryString = new URLSearchParams(paramString);
  let id = parseInt(queryString.get("id"));
  if (isNaN(id)) id = 3; //default shader has id 3
  console.log(id)
  getShaderSourceById(id);
}

function initEditorSplit() {
  Split(["#split-0", "#split-1"]);

  elements.canvas = document.getElementById("canvas");
  elements.sliders = [document.getElementById("slider-1")];

  elements.logArea = document.getElementById("log-area");
  elements.editor = ace.edit("editor");
  elements.editor.setTheme("ace/theme/monokai");
  elements.editor.session.setMode("ace/mode/glsl");
}

window.onload = function() {
  getShaderSource();
  initEditorSplit();
}

function main(defaultFragmentShaderSource) {

  elements.editor.setValue(defaultFragmentShaderSource);
  elements.editor.gotoLine(8);
  //textarea.textContent = defaultFragmentShaderSource;
  let gl = elements.canvas.getContext("webgl2")
  if (!gl) {
    alert("Sorry, you need web gl 2");
    return;
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
  document.getElementById("save-button").onclick = () => saveShader(gl, shader);
}

function render(gl, shader, time) {

  resize(gl.canvas);

  if (shaderUpdated) {
    shaderUpdated = false;
    var positionAttributelocation = gl.getAttribLocation(shader.program, "a_position");
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
  }


  var slider1Value = new Number(elements.sliders[0].value)
  var sliderUniformLocation = gl.getUniformLocation(shader.program, "slider");
  gl.uniform1f(sliderUniformLocation, slider1Value);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
  requestAnimationFrame((time) => render(gl, shader, time));
}

