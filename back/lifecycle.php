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
    } else if ($action_type === "Pick Up"){
        $odometer = $data['odometer'];
        $notes = $data['notes'];
        $update = "UPDATE rental_requests SET request_status = 'Picked Up', odometer_pickup = ?, condition_pickup = ? WHERE request_id = ?";
    }

    if(!empty($update)){
        $update_stmt = $conn->prepare($update);

        if($action_type!=="Pick Up"){
            $update_stmt->bind_param("i", $request_id);
        } else {
            $update_stmt->bind_param("isi", $odometer, $notes, $request_id);
        }

        if($update_stmt->execute()){
            echo json_encode(["stat"=>true]);
        } else {
            echo json_encode(["stat"=>false]);
        }
    }

}
?>