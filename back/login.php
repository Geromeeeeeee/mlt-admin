<?php
include 'header.php';
session_start();

$jsx_data = file_get_contents('php://input');
$data = json_decode($jsx_data, true);

if(isset($data['action'])) {
    if($data['action'] === 'login'){
        $email = $data['email'];
        $password = $data['password'];

        $query = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if($result->num_rows>0){
            $user = $result->fetch_assoc();
            if(password_verify($password, $user['password'])){
                if($user['type']==='admin'){
                    $_SESSION['user_id'] = $user['user_id'];
                    $_SESSION['type'] = 'admin';
                    echo json_encode(['error' => false]);
                } else {
                    echo json_encode(['error' => true, 'errType' => 'unauthorized']);
                }
            } else {
                echo json_encode(['error' => true, 'errType' => 'credentials']);
            }
        } else {
            echo json_encode(['error' => true, 'errType' => 'account']);
        }
    } else if ($data['action']==='logout'){
        session_start();
        $_SESSION = [];
        session_destroy();
    }
}
?>