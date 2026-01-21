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

$columnExists = function ($conn, $table, $column) {
    $tableSafe = $conn->real_escape_string($table);
    $columnSafe = $conn->real_escape_string($column);
    $result = $conn->query("SHOW COLUMNS FROM `$tableSafe` LIKE '$columnSafe'");
    return $result && $result->num_rows > 0;
};


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

$hasRating = $columnExists($conn, 'votes', 'rating');
$avgRatingSelect = $hasRating
    ? "(SELECT COALESCE(AVG(v.rating), 0) FROM votes v WHERE v.post_id = p.id)"
    : "0";
$ratingCountSelect = "(SELECT COUNT(*) FROM votes v WHERE v.post_id = p.id)";
$userRatingSelect = ($current_user_id && $hasRating)
    ? "(SELECT v.rating FROM votes v WHERE v.post_id = p.id AND v.user_id = $current_user_id LIMIT 1)"
    : "NULL";

$sql = "SELECT p.*, u.name as author_name, u.role as author_role,
        $avgRatingSelect as avg_rating,
        $ratingCountSelect as rating_count,
        $userRatingSelect as user_rating
        FROM posts p
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
            "rating" => round(floatval($row['avg_rating']), 1),
            "votes" => intval($row['rating_count']),
            "hasVoted" => !is_null($row['user_rating']) && floatval($row['user_rating']) > 0,
            "userRating" => !is_null($row['user_rating']) ? round(floatval($row['user_rating']), 1) : 0,
            "thumbnail" => isset($media[0]) ? $media[0]['file_path'] : "", 
            "media" => $media
        ];
        $posts[] = $post;
    }
}

echo json_encode($posts);
?>
