<?php

if ($_SERVER["REQUEST_METHOD"] != "POST") {
  die("error not post");
}


// collect value of input field
$id = $_POST['id'];
$source = $_POST['source'];
if (empty($id)) {
  die("no id?");
}

$servername = "192.168.10.198";
$username = getenv("SHADER_DATABASE_USERNAME");
$password = getenv("SHADER_DATABASE_PASSWORD");

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
  die("!Connection failed: " . $conn->connect_error);
}

$conn->query("USE shaders");
$sql = $conn->prepare("UPDATE shaders SET source = ? WHERE (id = ?)");
$sql->bind_param("si", $source, $id); //"s" -> string, "i" -> integer
$sql->execute();

$conn->close();
?>