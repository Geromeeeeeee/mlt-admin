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

            if(in_array($action_type,['Approve', 'Decline', 'Verify Downpayment', 'Reupload Downpayment', 'Verify Final Payment', 'Reupload Final Payment'])){
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
        
        $query = "SELECT r.total_cost, c.daily_rate, r.rental_date, r.rental_duration_days, r.amount_paid, r.request_status 
          FROM rental_requests r
          INNER JOIN cars c ON r.car_id = c.car_id
          WHERE r.request_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $request_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $rental = $result->fetch_assoc();
        $stmt->close();

        $dailyRate = (float)$rental['daily_rate'];
        $totalCost = (float)$rental['total_cost'];
        $amountPaid = (float)$rental['amount_paid'];
        $nonRefundable = $totalCost * 0.50;

        $pickupDate = new DateTime($rental['rental_date']);
        $today = new DateTime();
        $diff = $today->diff($pickupDate);
        $daysUsed = max(1, $diff->days);

        $usageFee = $daysUsed * $dailyRate;
        $totalDeduction = max($usageFee, $nonRefundable);
        
        $calculatedRefund = ($rental['request_status'] === "Early Return Approved") ? max(0, $amountPaid - $totalDeduction) : 0;

        $updateReq = "UPDATE rental_requests SET request_status = 'Returned' WHERE request_id = ?";
        $stmt1 = $conn->prepare($updateReq);
        $stmt1->bind_param("i", $request_id);
        $stmt1->execute();
        $stmt1->close();

        $insertDetails = "INSERT INTO rental_return_details (request_id, car_condition_return, odometer_return, damage_fee, final_refund_amount) 
                        VALUES (?, ?, ?, ?, ?)";
        $stmt2 = $conn->prepare($insertDetails);
        $stmt2->bind_param("isidd", $request_id, $condition, $odometer, $damage, $calculatedRefund);
        
        if ($stmt2->execute()) {
            echo json_encode(["stat" => true]);
        } else {
            echo json_encode(["stat" => false, "error" => "Failed to save details"]);
        }
        $stmt2->close();
    }
}
?>