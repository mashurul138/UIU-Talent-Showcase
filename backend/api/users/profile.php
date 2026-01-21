<?php
require "../../config/db.php";
require "../utils/jwt.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
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

$columnExists = function ($conn, $table, $column) {
    $tableSafe = $conn->real_escape_string($table);
    $columnSafe = $conn->real_escape_string($column);
    $result = $conn->query("SHOW COLUMNS FROM `$tableSafe` LIKE '$columnSafe'");
    return $result && $result->num_rows > 0;
};

$hasStudentId = $columnExists($conn, 'users', 'student_id');
$hasAvatar = $columnExists($conn, 'users', 'avatar');
$hasCreatedAt = $columnExists($conn, 'users', 'created_at');
$hasRating = $columnExists($conn, 'votes', 'rating');

$studentIdSelect = $hasStudentId ? "u.student_id" : "NULL";
$avatarSelect = $hasAvatar ? "u.avatar" : "NULL";
$createdAtSelect = $hasCreatedAt ? "u.created_at" : "NULL";
$ratingSumSelect = $hasRating ? "COALESCE(SUM(rating), 0)" : "0";

$sql = "
    SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        $studentIdSelect AS student_id,
        $avatarSelect AS avatar,
        $createdAtSelect AS created_at,
        COALESCE(SUM(CASE WHEN p.type = 'video' THEN 1 ELSE 0 END), 0) AS video_submissions,
        COALESCE(SUM(CASE WHEN p.type = 'audio' THEN 1 ELSE 0 END), 0) AS audio_submissions,
        COALESCE(SUM(CASE WHEN p.type = 'blog' THEN 1 ELSE 0 END), 0) AS blog_submissions,
        COALESCE(COUNT(p.id), 0) AS total_posts,
        COALESCE(SUM(p.views), 0) AS total_views,
        COALESCE(SUM(v.rating_count), 0) AS total_votes,
        COALESCE(SUM(v.rating_sum), 0) AS total_rating_sum
    FROM users u
    LEFT JOIN posts p ON p.user_id = u.id
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS rating_count, $ratingSumSelect AS rating_sum
        FROM votes
        GROUP BY post_id
    ) v ON v.post_id = p.id
    WHERE u.id = $user_id
    GROUP BY u.id
";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
    exit();
}

$row = $result->fetch_assoc();
if (!$row) {
    http_response_code(404);
    echo json_encode(["error" => "User not found"]);
    exit();
}

$total_posts = intval($row['total_posts']);
$total_votes = intval($row['total_votes']);
$total_rating_sum = floatval($row['total_rating_sum']);
$total_views = intval($row['total_views']);
$avg_rating = $total_votes > 0 ? round($total_rating_sum / $total_votes, 1) : 0;
$rating_points = $hasRating ? intval(round($total_rating_sum * 2)) : ($total_votes * 10);
$total_score = $total_views + $rating_points;

$activitySql = "
    SELECT
        p.id,
        p.title,
        p.type,
        p.status,
        p.created_at,
        p.views,
        COALESCE(v.rating_count, 0) AS votes
    FROM posts p
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS rating_count
        FROM votes
        GROUP BY post_id
    ) v ON v.post_id = p.id
    WHERE p.user_id = $user_id
    ORDER BY p.created_at DESC
    LIMIT 8
";

$recentActivity = [];
$activityResult = $conn->query($activitySql);
if ($activityResult) {
    while ($activity = $activityResult->fetch_assoc()) {
        $recentActivity[] = [
            "id" => strval($activity['id']),
            "title" => $activity['title'],
            "type" => $activity['type'],
            "status" => $activity['status'],
            "createdAt" => $activity['created_at'],
            "views" => intval($activity['views']),
            "votes" => intval($activity['votes'])
        ];
    }
}

echo json_encode([
    "user" => [
        "id" => strval($row['id']),
        "name" => $row['name'],
        "email" => $row['email'],
        "role" => $row['role'],
        "studentId" => $row['student_id'],
        "avatar" => $row['avatar'],
        "joinDate" => $row['created_at']
    ],
    "stats" => [
        "totalScore" => $total_score,
        "avgRating" => $avg_rating,
        "videoSubmissions" => intval($row['video_submissions']),
        "audioSubmissions" => intval($row['audio_submissions']),
        "blogSubmissions" => intval($row['blog_submissions']),
        "totalPosts" => $total_posts,
        "totalVotes" => $total_votes,
        "totalViews" => $total_views
    ],
    "recentActivity" => $recentActivity
]);
