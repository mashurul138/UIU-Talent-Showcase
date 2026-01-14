<?php
require "../../config/db.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'];
$password = $data['password'];

$result = $conn->query("SELECT * FROM user WHERE email='$email'");
$user = $result->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
    echo json_encode([
        "message" => "Login successful",
        "user_id" => $user['id'],
        "name" => $user['name'],
        "role" => $user['role']
    ]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
}
?>
