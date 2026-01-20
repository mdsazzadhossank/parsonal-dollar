<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

$servername = "localhost";
$username = "root";      // আপনার ডাটাবেজ ইউজারনেম দিন (হোস্টিংয়ে সাধারণত আলাদা হয়)
$password = "";          // আপনার ডাটাবেজ পাসওয়ার্ড দিন
$dbname = "dollar_tracker"; // আপনার ডাটাবেজের নাম

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}
?>