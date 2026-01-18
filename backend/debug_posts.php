<?php
require 'config/db.php';

$sql = "SELECT p.id, p.title, p.type, p.status, m.file_path 
        FROM posts p 
        LEFT JOIN media m ON p.id = m.post_id 
        ORDER BY p.created_at DESC LIMIT 5";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row["id"]. " - Title: " . $row["title"]. " - Type: " . $row["type"]. " - Status: " . $row["status"]. " - File: " . $row["file_path"]. "\n";
    }
} else {
    echo "0 results";
}
?>
