<?php
include 'header.php';

$jsx_data = file_get_contents('php://input');
$data = json_decode($jsx_data, true);

if($data){
    $action = $data['action'];

    if($action === "getRequests"){
        $getRecords = "SELECT rr.*, 
                   COALESCE(rr.amount_paid, 0) as amount_paid, 
                   u.fullname, 
                   c.model, 
                   c.plate_no, 
                   c.daily_rate, 
                   rr.rental_date, 
                   rr.rental_duration_days 
                   FROM rental_requests rr 
                   INNER JOIN users u ON rr.user_id = u.user_id
                   INNER JOIN cars c ON rr.car_id = c.car_id
                   ORDER BY request_id DESC";
        $result = $conn->query($getRecords);
        $results = [];

        if($result->num_rows>0){
            while($row = $result->fetch_assoc()){
                $results [] = $row;
            }
        }

        echo json_encode($results);
    } else if ($action === "getReturnRequests"){
        $getReturnRequests = "SELECT rrq.*, r.*, c.* FROM rental_return_requests rrq
        INNER JOIN rental_requests r ON rrq.request_id = r.request_id
        INNER JOIN cars c ON r.car_id = c.car_id
        WHERE r.request_status IN ('Return Requested', 'Early Return Requested', 'Late Return Requested', 'Return Approved', 'Early Return Approved', 'Late Return Approved')
        ORDER BY rrq.requested_at DESC";

        $returnResult = $conn->query($getReturnRequests);
        $returnResults = [];

        if($returnResult->num_rows>0){
            while($row = $returnResult->fetch_assoc()){
                $returnResults []=$row;
            }
        }
        echo json_encode($returnResults);
        exit();
    }
}
?>