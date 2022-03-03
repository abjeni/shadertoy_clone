<?php
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

$sql = "SELECT source FROM shaders WHERE (id = 3)";
$result = $conn->query($sql);
if ($result->num_rows <= 0) {
  die("!no default shader oops");
}

$row = $result->fetch_assoc();
$source = $row["source"];

$sql = $conn->prepare("INSERT INTO shaders (source) VALUES (?)");
$sql->bind_param("s", $source); //"s" -> string
$sql->execute();
$result = $sql->get_result();

$last_id = $conn->insert_id;
echo $last_id;

$conn->close();
?>