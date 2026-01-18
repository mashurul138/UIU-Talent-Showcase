<?php
require "../../config/db.php";
require "../utils/jwt.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password are required"]);
    exit();
}

$email = $conn->real_escape_string($data['email']);
$password = $data['password'];

$result = $conn->query("SELECT * FROM users WHERE email='$email'");

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
    exit();
}

$user = $result->fetch_assoc();

if (password_verify($password, $user['password'])) {
    
    // Generate JWT
    $payload = [
        "user_id" => $user['id'],
        "email" => $user['email'],
        "role" => $user['role'],
        "exp" => time() + (60 * 60 * 24) // 1 day expiration
    ];
    $token = JWT::encode($payload);

    echo json_encode([
        "message" => "Login successful",
        "token" => $token,
        "user" => [
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "role" => $user['role']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
}
?>
