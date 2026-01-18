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
    try {
        $user_data = JWT::decode($auth_data);
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }
}

if (!$user_data) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$voter_id = $user_data['user_id'];
$input = json_decode(file_get_contents("php://input"), true);
$candidate_id = isset($input['candidate_id']) ? intval($input['candidate_id']) : 0;

if ($candidate_id <= 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid candidate ID"]);
    exit();
}

if ($voter_id == $candidate_id) {
    http_response_code(400);
    echo json_encode(["error" => "You cannot vote for yourself"]);
    exit();
}

// Check if already voted
$checkSql = "SELECT id FROM user_votes WHERE voter_id = $voter_id AND candidate_id = $candidate_id";
$result = $conn->query($checkSql);

$action = "";
if ($result->num_rows > 0) {
    // Already voted, so remove vote
    $sql = "DELETE FROM user_votes WHERE voter_id = $voter_id AND candidate_id = $candidate_id";
    $action = "unvoted";
} else {
    // Insert vote
    $sql = "INSERT INTO user_votes (voter_id, candidate_id) VALUES ($voter_id, $candidate_id)";
    $action = "voted";
}

if ($conn->query($sql) === TRUE) {
    // Get updated vote count
    $countSql = "SELECT COUNT(*) as votes FROM user_votes WHERE candidate_id = $candidate_id";
    $countResult = $conn->query($countSql);
    $countRow = $countResult->fetch_assoc();
    
    // Check if current user has voted (for UI state)
    $hasVoted = ($action === "voted");

    echo json_encode([
        "message" => "Vote updated",
        "action" => $action,
        "votes" => intval($countRow['votes']),
        "has_voted" => $hasVoted
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error: " . $conn->error]);
}
?>
