<?php
require "../../config/db.php";
require "../utils/jwt.php";

header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Optional: Auth check if you want to return "has_voted" status for current user
$auth_data = JWT::get_bearer_token();
$current_user_id = 0;
if ($auth_data) {
    try {
        $user_data = JWT::decode($auth_data);
        $current_user_id = $user_data['user_id'];
    } catch (Exception $e) {
        // ignore
    }
}

// Get vote counts for all candidate users
$sql = "SELECT candidate_id, COUNT(*) as votes FROM user_votes GROUP BY candidate_id";
$result = $conn->query($sql);

$votes_map = [];
while ($row = $result->fetch_assoc()) {
    $votes_map[$row['candidate_id']] = intval($row['votes']);
}

// Get users that current user has voted for
$user_votes_map = [];
if ($current_user_id > 0) {
    $myVotesSql = "SELECT candidate_id FROM user_votes WHERE voter_id = $current_user_id";
    $myVotesResult = $conn->query($myVotesSql);
    while ($row = $myVotesResult->fetch_assoc()) {
        $user_votes_map[$row['candidate_id']] = true;
    }
}

echo json_encode([
    "votes" => $votes_map,
    "my_votes" => $user_votes_map
]);
?>
