<?php
include 'header.php';

if($_SERVER['REQUEST_METHOD']==="GET"){
    $getRecords = "SELECT rr.*, u.fullname, c.model, c.plate_no FROM rental_requests rr 
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
}
?>