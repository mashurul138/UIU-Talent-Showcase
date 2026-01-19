<?php
require "../../config/db.php";
require "../utils/jwt.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verify Token
$auth_data = JWT::get_bearer_token();
$user_data = null;
if ($auth_data) {
    $user_data = JWT::decode($auth_data);
}

if (!$user_data) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

// Handle File Upload & Post Creation
// Note: Create requests will be multipart/form-data
$title = isset($_POST['title']) ? $conn->real_escape_string($_POST['title']) : "";
$description = isset($_POST['description']) ? $conn->real_escape_string($_POST['description']) : "";
$type = isset($_POST['type']) ? $conn->real_escape_string(strtolower($_POST['type'])) : "blog";
$user_id = $user_data['user_id'];

if (empty($title) || empty($type)) {
    http_response_code(400);
    echo json_encode(["error" => "Title and Type are required"]);
    exit();
}

$duration = isset($_POST['duration']) ? $conn->real_escape_string($_POST['duration']) : "0:00";

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $upload_errors = [
        UPLOAD_ERR_INI_SIZE => "Uploaded file exceeds server limit (upload_max_filesize).",
        UPLOAD_ERR_FORM_SIZE => "Uploaded file exceeds form limit.",
        UPLOAD_ERR_PARTIAL => "Uploaded file was only partially received.",
        UPLOAD_ERR_NO_FILE => "No file was uploaded.",
        UPLOAD_ERR_NO_TMP_DIR => "Missing temporary folder for upload.",
        UPLOAD_ERR_CANT_WRITE => "Failed to write uploaded file to disk.",
        UPLOAD_ERR_EXTENSION => "File upload stopped by a PHP extension."
    ];
    $error_code = isset($_FILES['file']) ? $_FILES['file']['error'] : UPLOAD_ERR_NO_FILE;
    $message = $upload_errors[$error_code] ?? "File upload failed.";
    http_response_code(400);
    echo json_encode(["error" => $message]);
    exit();
}

// Insert Post
$sql = "INSERT INTO posts (user_id, title, description, type, status, duration) VALUES ('$user_id', '$title', '$description', '$type', 'pending', '$duration')";

if ($conn->query($sql) === TRUE) {
    $post_id = $conn->insert_id;
    
    // Handle File Upload if exists
    $file_url = "";
    $target_dir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR;
    if (!file_exists($target_dir) && !mkdir($target_dir, 0777, true)) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create upload directory."]);
        exit();
    }

    $original_name = $_FILES["file"]["name"];
    $extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));
    $base_name = pathinfo($original_name, PATHINFO_FILENAME);
    $base_name = preg_replace('/[^A-Za-z0-9_-]+/', '_', $base_name);
    $base_name = trim($base_name, '_');
    if ($base_name === '') {
        $base_name = 'file';
    }
    $file_name = time() . "_" . $base_name . ($extension ? "." . $extension : "");
    $target_file = $target_dir . $file_name;
    $file_type = $extension;

    // Basic file type validation could go here

    if (!move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to store uploaded file."]);
        exit();
    }

    // Save relative path for the frontend URL builder
    $file_url = "uploads/" . $file_name;

    $mediaSql = "INSERT INTO media (post_id, file_path, file_type, file_size) VALUES ('$post_id', '$file_url', '$file_type', " . $_FILES["file"]["size"] . ")";
    $conn->query($mediaSql);

    // Determine thumbnail (simulated for now, could be same as file or generated)
    $thumbnail = $file_url; 

    http_response_code(201);
    echo json_encode([
        "message" => "Post created successfully",
        "post" => [
            "id" => strval($post_id),
            "title" => $title,
            "type" => $type,
            "thumbnail" => $thumbnail
        ]
    ]);

} else {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $sql . "<br>" . $conn->error]);
}
?>
