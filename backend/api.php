<?php
include 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// ইনপুট রিড করা
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// --- TRANSACTIONS ---

if ($action == 'get_transactions' && $method == 'GET') {
    $sql = "SELECT * FROM transactions ORDER BY timestamp DESC";
    $result = $conn->query($sql);
    
    if ($result === false) {
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit();
    }

    $rows = [];
    while($row = $result->fetch_assoc()) {
        $row['amountUSD'] = (float)$row['amountUSD'];
        $row['exchangeRate'] = (float)$row['exchangeRate'];
        $row['extraFees'] = (float)$row['extraFees'];
        $row['totalBDT'] = (float)$row['totalBDT'];
        $row['timestamp'] = (int)$row['timestamp'];
        $rows[] = $row;
    }
    echo json_encode($rows);
}

elseif ($action == 'save_transaction' && $method == 'POST') {
    if (!$input) {
        echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
        exit();
    }

    $id = $input['id'];
    $type = $input['type'];
    $amount = $input['amountUSD'];
    $rate = $input['exchangeRate'];
    $fees = $input['extraFees'];
    $total = $input['totalBDT'];
    $date = $input['date'];
    $time = $input['timestamp'];

    $stmt = $conn->prepare("INSERT INTO transactions (id, type, amountUSD, exchangeRate, extraFees, totalBDT, date, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
         echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
         exit();
    }
    
    $stmt->bind_param("ssddddsi", $id, $type, $amount, $rate, $fees, $total, $date, $time);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
    }
    $stmt->close();
}

elseif ($action == 'delete_transaction' && $method == 'POST') {
    $id = $input['id'];
    $stmt = $conn->prepare("DELETE FROM transactions WHERE id = ?");
    $stmt->bind_param("s", $id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    $stmt->close();
}

// --- ACCOUNTS ---

elseif ($action == 'get_accounts' && $method == 'GET') {
    $sql = "SELECT * FROM accounts";
    $result = $conn->query($sql);
    $rows = [];
    if ($result) {
        while($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
    }
    echo json_encode($rows);
}

elseif ($action == 'save_account' && $method == 'POST') {
    $id = $input['id'];
    $user = $input['username'];
    $email = $input['email'];
    $phone = $input['phone'];
    $pass = $input['password'];

    $stmt = $conn->prepare("INSERT INTO accounts (id, username, email, phone, password) VALUES (?, ?, ?, ?, ?)");
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit();
    }
    $stmt->bind_param("sssss", $id, $user, $email, $phone, $pass);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    $stmt->close();
}

elseif ($action == 'delete_account' && $method == 'POST') {
    $id = $input['id'];
    $stmt = $conn->prepare("DELETE FROM accounts WHERE id = ?");
    $stmt->bind_param("s", $id);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
    $stmt->close();
}

$conn->close();
?>