<?php
include 'header.php';

$jsx_data = file_get_contents('php://input');
$data = json_decode($jsx_data, true);

if($data){
    $request_id = $data['requestID'];
    $action_type = $data['action'];
    $update = "";
    $insert = "";
    $insert_stmt = "";

    if($action_type!=="End Rental"){
         if($action_type === "Approve"){
            $update = "UPDATE rental_requests SET request_status = 'Approved' WHERE request_id = ?";
        } else if ($action_type === "Payment"){
            $update = "UPDATE rental_requests SET payment_status = 'Paid' WHERE request_id = ?";
        } else if ($action_type === "Pick Up"){
            $odometer = $data['odometer'];
            $notes = $data['notes'];
            $update = "UPDATE rental_requests SET request_status = 'Picked Up', odometer_pickup = ?, condition_pickup = ? WHERE request_id = ?";
        } else if ($action_type === "Approve Return"){

            $check_stat = "SELECT request_status FROM rental_requests WHERE request_id = ?";
            $stat_stmt = $conn->prepare($check_stat);
            $stat_stmt->bind_param("i", $request_id);
            $stat_stmt->execute();
            $current_stat = $stat_stmt->get_result()->fetch_assoc()['request_status'];
            $stat_stmt->close();

            $approved_stat = "Return Approved";

            if($current_stat === "Early Return Requested"){
                $approved_stat = "Early Return Approved";
            } else if ($current_stat === "Return Requested"){
                $approved_stat = "Return Approved";
            } else if ($current_stat === "Late Return Requested"){
                $approved_stat = "Late Return Approved";
            }

            $update = "UPDATE rental_return_requests t1 
            JOIN rental_requests t2 ON t1.request_id = t2.request_id
            SET t1.status = 'Approved',
                t2.request_status = ?
            WHERE t1.request_id = ?";
        }

        if(!empty($update)){
            $update_stmt = $conn->prepare($update);

            if($action_type==="Approve" || $action_type === "Payment"){
                $update_stmt->bind_param("i", $request_id);
            } else if ($action_type === "Pick Up"){
                $update_stmt->bind_param("isi", $odometer, $notes, $request_id);
            } else if ($action_type === "Approve Return"){
                $update_stmt->bind_param("si", $approved_stat, $request_id);
            }

            if($update_stmt->execute()){
                echo json_encode(["stat"=>true]);
            } else {
                echo json_encode(["stat"=>false]);
            }
        }

    } else if ($action_type === "End Rental"){
        $condition = $data['condition'];
        $odometer = $data['odometer'];
        $damage = $data['damage'];
        $refund = $data['refund'];
        
        $update = "UPDATE rental_return_requests t1 
        JOIN rental_requests t2 ON t1.request_id = t2.request_id
        SET t1.status = 'Returned',
        t2.request_status = 'Returned'
        WHERE t1.request_id = ?";
        $update_stmt = $conn->prepare($update);
        $update_stmt->bind_param("i", $request_id);

        $insert = "INSERT INTO rental_return_details (request_id, car_condition_return, odometer_return, damage_fee, final_refund_amount) VALUES (?, ?, ?, ?, ?)";
        $insert_stmt = $conn->prepare($insert);
        $insert_stmt->bind_param("isidd",$request_id, $condition, $odometer, $damage, $refund);

        if($insert_stmt->execute() && $update_stmt->execute()){
            $update_stmt->close();
            $insert_stmt->close();
            echo json_encode(["stat" => true]);
        } else {
            echo json_encode(["stat" => false]);
        }
    }
}
?>