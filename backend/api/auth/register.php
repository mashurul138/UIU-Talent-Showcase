<?php
require "../../config/db.php";
require "../utils/jwt.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

// Validation
if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Name, email, and password are required"]);
    exit();
}

$name = $conn->real_escape_string($data['name']);
$email = $conn->real_escape_string($data['email']);
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$role = isset($data['role']) ? $conn->real_escape_string($data['role']) : 'viewer';
if (!in_array($role, ['viewer', 'creator', 'admin'], true)) {
    $role = 'viewer';
}

// Check if email already exists
$checkQuery = "SELECT id FROM users WHERE email = '$email'";
$checkResult = $conn->query($checkQuery);

if ($checkResult->num_rows > 0) {
    http_response_code(409); // Conflict
    echo json_encode(["error" => "Email already exists"]);
    exit();
}

// Insert new user
$sql = "INSERT INTO users (name, email, password, role) VALUES ('$name', '$email', '$password', '$role')";

if ($conn->query($sql) === TRUE) {
    $user_id = $conn->insert_id;
    
    // Auto login (generate token)
    $payload = [
        "user_id" => $user_id,
        "email" => $email,
        "role" => $role,
        "exp" => time() + (60 * 60 * 24)
    ];
    $token = JWT::encode($payload);

    http_response_code(201);
    echo json_encode([
        "message" => "User registered successfully",
        "token" => $token,
        "user" => [
            "id" => $user_id,
            "name" => $name,
            "email" => $email,
            "role" => $role
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $sql . "<br>" . $conn->error]);
}
?>
