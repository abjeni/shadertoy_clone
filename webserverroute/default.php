<?php
$servername = "192.168.10.198";
$username = getenv("SHADER_DATABASE_USERNAME");
$password = getenv("SHADER_DATABASE_PASSWORD");

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$conn->query("USE shaders");

$sql = "SELECT source FROM shaders WHERE (id = 3)";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  // output data of each row
  while($row = $result->fetch_assoc()) {
    echo $row["source"];
  }
} else {
  echo "error no default shader >:D";
}

$conn->close();
?>