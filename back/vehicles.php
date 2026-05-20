<?php
include 'header.php';

if (!empty($_POST)) {
    $data = $_POST;
} else {
    $jsx_data = file_get_contents('php://input');
    $data = json_decode($jsx_data, true);
}

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
        exit();
    }

    if($action === "updateVehicles"){

        $id = $data['id'];
        $model = $data['model'];
        $plate = $data['plate'];
        $rate = $data['rate'];
        $owner = $data['owner'];
        $desc = $data['desc'];
        $availability = $data['availability'];

        $update = "UPDATE cars SET
                    model = ?,
                    plate_no = ?,
                    daily_rate = ?,
                    owner = ?,
                    description = ?,
                    availability = ?
                    WHERE car_id = ?";

        $stmt = $conn->prepare($update);
        $stmt->bind_param("ssdssii", $model, $plate, $rate, $owner, $desc, $availability, $id);
        $stmt->execute();
        $stmt->close();

        $clear_query = "DELETE FROM car_images WHERE car_id = ?";
        $clear_stmt = $conn->prepare($clear_query);
        $clear_stmt->bind_param("i", $id);
        $clear_stmt->execute();
        $clear_stmt->close();

        $target_dir = "../../vnm-system1/php/cars/uploads/cars/";

            if (!is_dir($target_dir)) {
                mkdir($target_dir, 0777, true);
            }
            
            for ($slot = 1; $slot <= 4; $slot++) {
                $fileKey = 'car_image_' . $slot;
                
                if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === 0) {
                    $file_name = $_FILES[$fileKey]['name'];
                    $file_tmp = $_FILES[$fileKey]['tmp_name'];
                    
                    $unique_name = time() . "_" . $slot . "_" . basename($file_name);
                    
                    if (move_uploaded_file($file_tmp, $target_dir . $unique_name)) {
                        $insert_img = "INSERT INTO car_images (car_id, image_path) VALUES (?, ?)";
                        $img_stmt = $conn->prepare($insert_img);
                        if (!$img_stmt) {
                            echo json_encode(["status" => "error", "message" => "Prepare failed (insert new): " . $conn->error]);
                            exit();
                        }
                        $img_stmt->bind_param("is", $id, $unique_name);
                        if (!$img_stmt->execute()) {
                            echo json_encode(["status" => "error", "message" => "Execute failed (insert new): " . $img_stmt->error]);
                            $img_stmt->close();
                            exit();
                        }
                        $img_stmt->close();
                    }
                } 
                
                else if (isset($data["existing_images_" . $slot])) {
                    $old_path = $data["existing_images_" . $slot];
                    
                    $insert_old = "INSERT INTO car_images (car_id, image_path) VALUES (?, ?)";
                    $old_stmt = $conn->prepare($insert_old);
                    if (!$old_stmt) {
                        echo json_encode(["status" => "error", "message" => "Prepare failed (insert existing): " . $conn->error]);
                        exit();
                    }
                    $old_stmt->bind_param("is", $id, $old_path);
                    if (!$old_stmt->execute()) {
                        echo json_encode(["status" => "error", "message" => "Execute failed (insert existing): " . $old_stmt->error]);
                        $old_stmt->close();
                        exit();
                    }
                    $old_stmt->close();
                }
                
                else {
                    $empty_placeholder = "";
                    $insert_empty = "INSERT INTO car_images (car_id, image_path) VALUES (?, ?)";
                    $empty_stmt = $conn->prepare($insert_empty);
                    if (!$empty_stmt) {
                        echo json_encode(["status" => "error", "message" => "Prepare failed (insert empty): " . $conn->error]);
                        exit();
                    }
                    $empty_stmt->bind_param("is", $id, $empty_placeholder);
                    if (!$empty_stmt->execute()) {
                        echo json_encode(["status" => "error", "message" => "Execute failed (insert empty): " . $empty_stmt->error]);
                        $empty_stmt->close();
                        exit();
                    }
                    $empty_stmt->close();
                }
            }
    }
}
?>