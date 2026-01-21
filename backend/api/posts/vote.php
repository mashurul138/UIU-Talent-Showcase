<?php
require "../../config/db.php";
require "../utils/jwt.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
$post_id = isset($input['post_id']) ? intval($input['post_id']) : 0;
$rating = isset($input['rating']) ? floatval($input['rating']) : null;

if ($post_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid post ID"]);
    exit();
}

if ($rating === null) {
    http_response_code(400);
    echo json_encode(["error" => "Rating is required"]);
    exit();
}

$scaled = $rating * 2;
if ($rating < 0.5 || $rating > 5 || abs($scaled - round($scaled)) > 0.001) {
    http_response_code(400);
    echo json_encode(["error" => "Rating must be between 0.5 and 5 in 0.5 increments"]);
    exit();
}

$rating = round($rating * 2) / 2;

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

$user_id = $user_data['user_id'];

// Ensure rating column exists
$ratingColumnResult = $conn->query("SHOW COLUMNS FROM votes LIKE 'rating'");
if (!$ratingColumnResult || $ratingColumnResult->num_rows === 0) {
    http_response_code(500);
    echo json_encode(["error" => "Rating column missing. Add rating DECIMAL(3,1) to votes table."]);
    exit();
}

$ratingValue = $conn->real_escape_string(number_format($rating, 1, '.', ''));
$upsertSql = "
    INSERT INTO votes (user_id, post_id, rating)
    VALUES ($user_id, $post_id, $ratingValue)
    ON DUPLICATE KEY UPDATE rating = VALUES(rating)
";

if ($conn->query($upsertSql) !== TRUE) {
    http_response_code(500);
    echo json_encode(["error" => "Error saving rating"]);
    exit();
}

// Get updated rating stats
$statsSql = "SELECT COUNT(*) as rating_count, COALESCE(AVG(rating), 0) as avg_rating FROM votes WHERE post_id = $post_id";
$statsResult = $conn->query($statsSql);
$ratingCount = 0;
$avgRating = 0.0;
if ($statsResult && $statsResult->num_rows > 0) {
    $row = $statsResult->fetch_assoc();
    $ratingCount = intval($row['rating_count']);
    $avgRating = round(floatval($row['avg_rating']), 1);
}

echo json_encode([
    "message" => "Success",
    "rating" => $avgRating,
    "ratingCount" => $ratingCount,
    "userRating" => $rating
]);
?>
