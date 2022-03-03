<!DOCTYPE html>
<head>
  <meta charset="utf-8">
  <title>list of shaders</title>
  <script src="newShader.js"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <br>
  <br>
  <button id="new_shader">new shader</button>
  <br>
  <br>
  <?php
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

    $sql = "SELECT source, id FROM shaders";
    $rows = $conn->query($sql);

    if ($rows->num_rows > 0) {
      // output data of each row
      foreach ($rows as $row) {
        echo "<a href='index.html?id=" . $row['id'] . "'><div class='shader'><p>" . $row['id'] . ": " . str_replace("\n","<br>",$row['source']) . "</p></div></a><br>";
      }
    } else {
      echo "error no default shader >:D";
    }

    $conn->close();
  ?>
</body>