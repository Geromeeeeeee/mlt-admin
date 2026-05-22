<?php
include 'header.php';

$jsx_data = file_get_contents('php://input');
$data = json_decode($jsx_data, true);

if($data){
    $action = $data['action'];
    if($action === "getUsers"){
        $user = "SELECT * FROM users";
        $result = $conn->query($user);
        $user_data = [];

        if($result){
            while($row = $result->fetch_assoc()){
                $user_data[]=$row;
            }
        }

        echo json_encode($user_data);
    } else if ($action === "archiveUser" || $action === "unarchiveUser"){
        $user_id = $data['uid'];
        $user = "";
        if($action === "archiveUser"){
            $user = "UPDATE users
            SET status = 0, is_archived = 1
            WHERE user_id = ?";
        } else if ($action === "unarchiveUser"){
            $user = "UPDATE users
            SET status = 1, is_archived = 0
            WHERE user_id = ?";
        }
        $archive_stmt = $conn->prepare($user);
        $archive_stmt->bind_param("i", $user_id);
        $archive_stmt->execute();
        $archive_stmt->close();
        exit();
    }
}
?>