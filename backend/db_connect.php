<?php
// প্রিফ্লাইট রিকোয়েস্ট হ্যান্ডলিং (CORS)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "root";      // আপনার ডাটাবেজ ইউজারনেম
$password = "";          // আপনার ডাটাবেজ পাসওয়ার্ড
$dbname = "dollar_tracker"; // আপনার ডাটাবেজের নাম

// JSON এরর আটকাতে PHP এর নিজস্ব ওয়ার্নিং বন্ধ রাখা
error_reporting(E_ALL);
ini_set('display_errors', 0);

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Connection Failed: " . $conn->connect_error]);
    exit();
}

// বাংলা লেখা সঠিকভাবে সেভ হওয়ার জন্য
$conn->set_charset("utf8mb4");
?>