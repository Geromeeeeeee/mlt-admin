<?php
include 'header.php';

$jsx_data = file_get_contents('php://input');
$data = json_decode($jsx_data, true);

if($data){
    $action = $data['action'];
    if($action === "getVehicles"){
        $get = "SELECT cars.*, GROUP_CONCAT(car_images.image_path) AS all_images FROM cars LEFT JOIN car_images ON car_images.car_id = cars.car_id GROUP BY cars.car_id";
        $get_result = mysqli_query($conn, $get);
        $vehicle_details = [];
        if($get_result->num_rows>0){
            while($row = $get_result->fetch_assoc()){
                $vehicle_details [] = $row;
            }
        }
        echo json_encode($vehicle_details);
    }

    //To follow ung for updating kasi nalilito pa ako
}
?>