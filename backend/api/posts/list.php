<?php
require "../../config/db.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$type = isset($_GET['type']) ? $conn->real_escape_string($_GET['type']) : null;
$status = isset($_GET['status']) ? $conn->real_escape_string($_GET['status']) : null;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;


// Get user ID from token if present (for has_voted check)
require "../utils/jwt.php";
$auth_token = JWT::get_bearer_token();
$current_user_id = null;
if ($auth_token) {
    $user_data = JWT::decode($auth_token);
    if ($user_data) {
        $current_user_id = $user_data['user_id'];
    }
}

$sql = "SELECT p.*, u.name as author_name, u.role as author_role,
        (SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id) as vote_count";

if ($current_user_id) {
    $sql .= ", (SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id AND v.user_id = $current_user_id) as has_voted";
} else {
    $sql .= ", 0 as has_voted";
}

$sql .= " FROM posts p 
        JOIN users u ON p.user_id = u.id";

$whereClauses = [];
if ($type) {
    $whereClauses[] = "p.type = '$type'";
}
if ($status) {
    $whereClauses[] = "p.status = '$status'";
}

if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

$sql .= " ORDER BY p.created_at DESC LIMIT $limit";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
    exit();
}

$posts = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Fetch media for each post
        $post_id = $row['id'];
        $mediaSql = "SELECT * FROM media WHERE post_id = $post_id";
        $mediaResult = $conn->query($mediaSql);
        $media = [];
        while($m = $mediaResult->fetch_assoc()) {
            $media[] = $m;
        }

        // Structure similar to frontend Post type
        $post = [
            "id" => strval($row['id']),
            "title" => $row['title'],
            "description" => $row['description'],
            "authorId" => strval($row['user_id']),
            "authorName" => $row['author_name'],
            "authorRole" => $row['author_role'],
            "type" => $row['type'],
            "uploadDate" => $row['created_at'],
            "status" => $row['status'],
            "views" => intval($row['views']),
            "rating" => 0, // Not implemented yet
            "votes" => intval($row['vote_count']),
            "hasVoted" => intval($row['has_voted']) > 0,
            "thumbnail" => isset($media[0]) ? $media[0]['file_path'] : "", 
            "media" => $media
        ];
        $posts[] = $post;
    }
}

echo json_encode($posts);
?>
