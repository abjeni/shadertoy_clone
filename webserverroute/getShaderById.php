<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // collect value of input field
  $id = $_POST['id'];
  if (empty($id)) {
    echo "list:\n";
    foreach ($_POST as $key=>$value) {
      echo "key: ".$key.", value: ".$value."\n";
    }
    die("no id?");
  }

  $servername = "192.168.10.124";
  $username = getenv("SHADER_DATABASE_USERNAME");
  $password = getenv("SHADER_DATABASE_PASSWORD");

  // Create connection
  $conn = new mysqli($servername, $username, $password);

  // Check connection
  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }

  $conn->query("USE shaders");


  $sql = $conn->prepare("SELECT source FROM shaders WHERE (id = ?)");
  $sql->bind_param("i", $id); //"i" -> integer
  $sql->execute();
  $result = $sql->get_result();

  if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
      echo $row["source"];
    }
  } else {
    die("shader not found");
  }
}

$conn->close();
?>