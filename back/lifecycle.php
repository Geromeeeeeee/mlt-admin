<?php
include 'header.php';

$jsx_data = file_get_contents('php://input');
$data = json_decode($jsx_data, true);

if($data){
    $request_id = $data['requestID'];
    $action_type = $data['action'];
    $update = "";
    $update2 = "";
    $insert = "";
    $insert_stmt = "";

    if($action_type!=="End Rental"){
         if($action_type === "Approve"){
            $update = "UPDATE rental_requests SET request_status = 'Approved' WHERE request_id = ?";
        } else if($action_type === "Decline"){
            $update = "UPDATE rental_requests SET request_status = 'Cancelled' WHERE request_id = ?";
        } else if ($action_type === "Verify Downpayment"){
            $update = "UPDATE rental_requests SET payment_status = 'Downpayment Verified', amount_paid = total_cost * 0.5 WHERE request_id = ?";
        }else if($action_type === "Reupload Downpayment"){
            $update = "UPDATE rental_requests SET payment_status = 'Downpayment Reupload Required', downpayment_proof_path = null WHERE request_id = ?";
        }else if($action_type === "Verify Final Payment"){
            $update = "UPDATE rental_requests SET payment_status = 'Fully Paid', amount_paid = total_cost WHERE request_id = ?";
        } else if ($action_type === "Reupload Final Payment"){
            $update = "UPDATE rental_requests SET payment_status = 'Final Reupload Required', final_payment_proof_path = null WHERE request_id = ?";
        }else if ($action_type === "Pick Up"){
            $odometer = $data['odometer'];
            $notes = $data['notes'];
            $update = "UPDATE rental_requests SET request_status = 'Picked Up', odometer_pickup = ?, condition_pickup = ? WHERE request_id = ?";
            $update2 = "INSERT INTO rental_pickup_details (request_id, pickup_date_actual, car_condition_pickup, odometer_pickup) VALUES (?, NOW(), ?, ?)";
        } else if ($action_type === "Approve Return"){

            $check_stat = "SELECT r.request_status, rrq.total_deducted_cost FROM rental_requests r LEFT JOIN rental_return_requests rrq ON r.request_id = rrq.request_id WHERE r.request_id = ?";
            $stat_stmt = $conn->prepare($check_stat);
            $stat_stmt->bind_param("i", $request_id);
            $stat_stmt->execute();
            $final_cost = $stat_stmt->get_result();
            $final_cost_row = $final_cost->fetch_assoc();
            $current_stat = $final_cost_row['request_status'];
            $total_deducted_cost = $final_cost_row['total_deducted_cost'];
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
        } else if ($action_type === "Approve Extension") {
            $fetch_ext = "SELECT request_id, days_to_extend, additional_cost FROM rental_extension_requests WHERE extension_id = ?";
            $stmt_ext = $conn->prepare($fetch_ext);
            $stmt_ext->bind_param("i", $request_id);
            $stmt_ext->execute();
            $ext_data = $stmt_ext->get_result()->fetch_assoc();
            $stmt_ext->close();

            if ($ext_data) {
                $update_ext = "UPDATE rental_extension_requests SET status = 'Approved' WHERE extension_id = ?";
                $stmt1 = $conn->prepare($update_ext);
                $stmt1->bind_param("i", $request_id);
                
                $update_rental = "UPDATE rental_requests 
                                SET rental_duration_days = rental_duration_days + ?, 
                                    total_cost = total_cost + ?,
                                    payment_status = 'Extension Payment Pending' 
                                WHERE request_id = ?";
                $stmt2 = $conn->prepare($update_rental);
                $stmt2->bind_param("idi", $ext_data['days_to_extend'], $ext_data['additional_cost'], $ext_data['request_id']);

                if ($stmt1->execute() && $stmt2->execute()) {
                    echo json_encode(["stat" => true]);
                } else {
                    echo json_encode(["stat" => false, "error" => "Partial update failure"]);
                }
                
                exit();
            }
        } else if ($action_type === "Verify Extension Payment") {
            $fetch_ext = "SELECT request_id FROM rental_extension_requests WHERE extension_id = ?";
            $stmt_ext = $conn->prepare($fetch_ext);
            $stmt_ext->bind_param("i", $request_id);
            $stmt_ext->execute();
            $ext_data = $stmt_ext->get_result()->fetch_assoc();
            $stmt_ext->close();

            if ($ext_data) {
                $update_rental = "UPDATE rental_requests SET payment_status = 'Fully Paid', amount_paid = total_cost WHERE request_id = ?";
                $stmt2 = $conn->prepare($update_rental);
                $stmt2->bind_param("i", $ext_data['request_id']);

                if ($stmt2->execute()) {
                    echo json_encode(["stat" => true]);
                } else {
                    echo json_encode(["stat" => false, "error" => "Partial update failure"]);
                }

                exit();
            }
        } else if ($action_type === "Reupload Extension Payment") {
            $fetch_ext = "SELECT request_id FROM rental_extension_requests WHERE extension_id = ?";
            $stmt_ext = $conn->prepare($fetch_ext);
            $stmt_ext->bind_param("i", $request_id);
            $stmt_ext->execute();
            $ext_data = $stmt_ext->get_result()->fetch_assoc();
            $stmt_ext->close();

            if ($ext_data) {
                $update_rental = "UPDATE rental_requests SET payment_status = 'Extension Reupload' WHERE request_id = ?";
                $stmt2 = $conn->prepare($update_rental);
                $stmt2->bind_param("i", $ext_data['request_id']);

                if ($stmt2->execute()) {
                    echo json_encode(["stat" => true]);
                } else {
                    echo json_encode(["stat" => false, "error" => "Partial update failure"]);
                }

                exit();
            }
        } else if ($action_type === "Decline Extension") {
            $update = "UPDATE rental_extension_requests SET status = 'Declined' WHERE extension_id = ?";
        }

        if(!empty($update)){
            $update_stmt = $conn->prepare($update);
            $update2_stmt = "";

            if(in_array($action_type,['Approve', 'Decline', 'Verify Downpayment', 'Reupload Downpayment', 'Verify Final Payment', 'Reupload Final Payment', 'Approve Extension', 'Decline Extension'])){
                $update_stmt->bind_param("i", $request_id);
            } else if ($action_type === "Approve Return"){
                $update_stmt->bind_param("si", $approved_stat, $request_id);
            } else if ($action_type === "Pick Up"){
                $update_stmt->bind_param("isi", $odometer, $notes, $request_id);
                $update2_stmt = $conn->prepare($update2);
                $update2_stmt->bind_param("isi", $request_id, $notes, $odometer);
            }

            if($update_stmt->execute()){
                if($action_type === 'Pick Up'){
                    if($update2_stmt->execute()){
                        echo json_encode(["stat"=>true]);
                    } else {
                        echo json_encode(["stat"=>false, "error"=>"Failed to insert pickup details"]);
                    }
                } 
                else if ($action_type === 'Approve Return'){
                    echo json_encode(["stat" => true, "final_cost" => $total_deducted_cost]);
                } 
                else {
                    echo json_encode(["stat"=>true]);
                }
            } else {
                echo json_encode(["stat"=>false, "error"=>"Database update failed"]);
            }
        }

    } else if ($action_type === "End Rental"){
        $condition = $data['condition'];
        $odometer = $data['odometer'];
        $damage = $data['damage'];
        
        $query = "SELECT 
        r.total_cost, 
        c.daily_rate,
        c.odometer, 
        r.rental_date, 
        r.rental_duration_days, 
        r.amount_paid, 
        r.request_status,
        rrq.calc_refund,
        rrq.calc_late_fee 
          FROM rental_requests r
          INNER JOIN cars c ON r.car_id = c.car_id
          LEFT JOIN rental_return_requests rrq ON r.request_id = rrq.request_id
          WHERE r.request_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $request_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $rental = $result->fetch_assoc();
        $stmt->close();

        $refund = $rental['calc_refund'] ?? 0;
        $late_fee = $rental['calc_late_fee'] ?? 0;

        $updateReq = "UPDATE rental_requests SET request_status = 'Returned' WHERE request_id = ?";
        $stmt1 = $conn->prepare($updateReq);
        $stmt1->bind_param("i", $request_id);
        $stmt1->execute();
        $stmt1->close();

        $insertDetails = "INSERT INTO rental_return_details (request_id, return_date_actual,car_condition_return, odometer_return, damage_fee, final_refund_amount, late_fee) 
                        VALUES (?, CURDATE(), ?, ?, ?, ?, ?)";
        $stmt2 = $conn->prepare($insertDetails);
        $stmt2->bind_param("isiddd", $request_id, $condition, $odometer, $damage, $refund, $late_fee);

        $updateReq2 = "UPDATE cars c JOIN rental_requests r ON c.car_id = r.car_id SET c.odometer = ? WHERE r.car_id = c.car_id AND r.request_id = ?";
        $stmt3 = $conn->prepare($updateReq2);
        $stmt3->bind_param("di", $odometer, $request_id);
        $stmt3->execute();
        $stmt3->close();

        if ($stmt2->execute()) {
            echo json_encode(["stat" => true]);
        } else {
            echo json_encode(["stat" => false, "error" => "Failed to save details"]);
        }
        $stmt2->close();
    }
}
?>