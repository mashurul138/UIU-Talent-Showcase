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
$stored_password = $user['password'];

$is_valid_password = password_verify($password, $stored_password);
if (!$is_valid_password && hash_equals($stored_password, $password)) {
    // Support legacy plaintext passwords by upgrading to a hash on successful login.
    $is_valid_password = true;
    $new_hash = password_hash($password, PASSWORD_DEFAULT);
    $user_id = intval($user['id']);
    $conn->query("UPDATE users SET password='$new_hash' WHERE id=$user_id");
}

if ($is_valid_password) {
    $role = $user['role'];
    if (!in_array($role, ['viewer', 'creator', 'admin'], true)) {
        $role = 'viewer';
        $user_id = intval($user['id']);
        $conn->query("UPDATE users SET role='$role' WHERE id=$user_id");
    }

    // Role-based restrictions
    if ($role === 'admin' && $email !== 'admin@uiu.ac.bd') {
        http_response_code(403);
        echo json_encode(["error" => "Unauthorized access"]);
        exit();
    }

    // Generate JWT
    $payload = [
        "user_id" => $user['id'],
        "email" => $user['email'],
        "role" => $role,
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
            "role" => $role
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
}
