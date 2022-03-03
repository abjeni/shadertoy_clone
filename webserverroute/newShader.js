
function redirectToShaderId(text) {
  if (text[0] == "!") {
    console.log(text);
    return;
  }

  window.location.href=".?id="+text;
}

function createNewShader() {
  fetch("newShader.php").then(function(response) {
    response.text().then(redirectToShaderId);
  });
}

window.onload = () => {
  document.getElementById("new_shader").onclick = createNewShader;
}