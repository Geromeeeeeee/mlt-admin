<?php
include 'header.php';

$jsx_data = file_get_contents('php://input');
$data = json_decode($jsx_data, true);

if($data){
    $request_id = $data['requestID'];
    $action_type = $data['action'];
    $update = "";

    if($action_type === "Approve"){
        $update = "UPDATE rental_requests SET request_status = 'Approved' WHERE request_id = ?";
    } else if ($action_type === "Payment"){
        $update = "UPDATE rental_requests SET payment_status = 'Paid' WHERE request_id = ?";
    }

    if(!empty($update)){
        $update_stmt = $conn->prepare($update);
        $update_stmt->bind_param("i", $request_id);

        if($update_stmt->execute()){
            echo json_encode(["stat"=>true]);
        } else {
            echo json_encode(["stat"=>false]);
        }
    }

}
?>