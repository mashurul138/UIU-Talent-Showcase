<?php
require "../../config/db.php";

// Allow JSON input
header("Content-Type: application/json");

// Get input data
$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_BCRYPT);
$role = "user";

// Check if email already exists
$check = $conn->query("SELECT id FROM user WHERE email='$email'");
if ($check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["error" => "Email already exists"]);
    exit;
}

// Insert user
$sql = "INSERT INTO user (name, email, password, role)
        VALUES ('$name', '$email', '$password', '$role')";

if ($conn->query($sql)) {
    echo json_encode(["message" => "User registered successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Registration failed"]);
}
?>
