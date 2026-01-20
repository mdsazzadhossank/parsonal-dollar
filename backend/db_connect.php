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

// ১. প্রথমে ডাটাবেজ ছাড়াই কানেক্ট করার চেষ্টা
$conn = new mysqli($servername, $username, $password);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Connection Failed: " . $conn->connect_error]);
    exit();
}

// ২. ডাটাবেজ না থাকলে তৈরি করা
$sql = "CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
if (!$conn->query($sql)) {
    echo json_encode(["status" => "error", "message" => "Error creating database: " . $conn->error]);
    exit();
}

// ৩. ডাটাবেজ সিলেক্ট করা
$conn->select_db($dbname);
$conn->set_charset("utf8mb4");

// ৪. টেবিলগুলো না থাকলে তৈরি করা
$transactionsTable = "CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(10),
    amountUSD DECIMAL(10,2),
    exchangeRate DECIMAL(10,2),
    extraFees DECIMAL(10,2),
    totalBDT DECIMAL(15,2),
    date VARCHAR(50),
    timestamp BIGINT
)";

$accountsTable = "CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    password VARCHAR(255)
)";

if (!$conn->query($transactionsTable)) {
    echo json_encode(["status" => "error", "message" => "Error creating transactions table: " . $conn->error]);
    exit();
}

if (!$conn->query($accountsTable)) {
    echo json_encode(["status" => "error", "message" => "Error creating accounts table: " . $conn->error]);
    exit();
}
?>