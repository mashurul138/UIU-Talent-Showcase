<?php
require "../../config/db.php";
require "../utils/jwt.php";

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$auth_token = JWT::get_bearer_token();
$user_data = $auth_token ? JWT::decode($auth_token) : null;

if (!$user_data || !isset($user_data['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$user_id = intval($user_data['user_id']);
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input"]);
    exit();
}

$columnExists = function ($conn, $table, $column) {
    $tableSafe = $conn->real_escape_string($table);
    $columnSafe = $conn->real_escape_string($column);
    $result = $conn->query("SHOW COLUMNS FROM `$tableSafe` LIKE '$columnSafe'");
    return $result && $result->num_rows > 0;
};

$hasStudentId = $columnExists($conn, 'users', 'student_id');
$hasAvatar = $columnExists($conn, 'users', 'avatar');
$hasCreatedAt = $columnExists($conn, 'users', 'created_at');

$fields = [];

if (array_key_exists('name', $data)) {
    $name = trim(strval($data['name']));
    if ($name === '') {
        http_response_code(400);
        echo json_encode(["error" => "Name is required"]);
        exit();
    }
    $nameSafe = $conn->real_escape_string($name);
    $fields[] = "name='$nameSafe'";
}

if (array_key_exists('email', $data)) {
    $email = trim(strval($data['email']));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["error" => "Valid email is required"]);
        exit();
    }
    $emailSafe = $conn->real_escape_string($email);
    $checkResult = $conn->query("SELECT id FROM users WHERE email='$emailSafe' AND id != $user_id");
    if ($checkResult && $checkResult->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["error" => "Email already exists"]);
        exit();
    }
    $fields[] = "email='$emailSafe'";
}

if ($hasStudentId && array_key_exists('studentId', $data)) {
    $studentId = trim(strval($data['studentId']));
    if ($studentId === '') {
        $fields[] = "student_id=NULL";
    } else {
        $studentIdSafe = $conn->real_escape_string($studentId);
        $fields[] = "student_id='$studentIdSafe'";
    }
}

if ($hasAvatar && array_key_exists('avatar', $data)) {
    $avatar = trim(strval($data['avatar']));
    if ($avatar === '') {
        $fields[] = "avatar=NULL";
    } else {
        $avatarSafe = $conn->real_escape_string($avatar);
        $fields[] = "avatar='$avatarSafe'";
    }
}

if (array_key_exists('password', $data)) {
    $password = strval($data['password']);
    if (trim($password) !== '') {
        $passwordHash = $conn->real_escape_string(password_hash($password, PASSWORD_DEFAULT));
        $fields[] = "password='$passwordHash'";
    }
}

if (count($fields) === 0) {
    http_response_code(400);
    echo json_encode(["error" => "No profile changes provided"]);
    exit();
}

$sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = $user_id";

if ($conn->query($sql) !== TRUE) {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
    exit();
}

$studentIdSelect = $hasStudentId ? "student_id" : "NULL AS student_id";
$avatarSelect = $hasAvatar ? "avatar" : "NULL AS avatar";
$createdAtSelect = $hasCreatedAt ? "created_at" : "NULL AS created_at";
$userResult = $conn->query("SELECT id, name, email, role, $studentIdSelect, $avatarSelect, $createdAtSelect FROM users WHERE id = $user_id");

if (!$userResult) {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
    exit();
}

$userRow = $userResult->fetch_assoc();
if (!$userRow) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit();
}

echo json_encode([
    "message" => "Profile updated",
    "user" => [
        "id" => strval($userRow['id']),
        "name" => $userRow['name'],
        "email" => $userRow['email'],
        "role" => $userRow['role'],
        "studentId" => $userRow['student_id'],
        "avatar" => $userRow['avatar'],
        "joinDate" => $userRow['created_at']
    ]
]);
?>
