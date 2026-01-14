<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "uiu_talent_show";

$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>
