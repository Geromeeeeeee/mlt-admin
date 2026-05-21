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
        $get = "SELECT cars.*, GROUP_CONCAT(car_images.image_path ORDER BY car_images.image_id ASC) AS all_images FROM cars LEFT JOIN car_images ON car_images.car_id = cars.car_id GROUP BY cars.car_id";
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
        $main_image_filename = null;
            
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

                    if ($slot === 1) {
                        $main_image_filename = $unique_name;
                    }
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

                if ($slot === 1) {
                    $main_image_filename = $old_path;
                }
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

                if ($slot === 1) {
                    $main_image_filename = $empty_placeholder;
                }
            }
        }

        if ($main_image_filename !== null) {
            $update_main_img = "UPDATE cars SET image = ? WHERE car_id = ?";
            $main_img_stmt = $conn->prepare($update_main_img);
            $main_img_stmt->bind_param("si", $main_image_filename, $id);
            $main_img_stmt->execute();
            $main_img_stmt->close();
        }
    }

    if($action === "addVehicle"){
        $model = $data['model'];
        $plate = $data['plate'];
        $brand = $data['brand'];
        $year = $data['year'];
        $rate = $data['rate'];
        $owner = $data['owner'];
        $fuel = $data['fuel'];
        $trans = $data['trans'];
        $desc = $data['desc'];
        $availability = $data['availability'];

        $add = "INSERT INTO cars (model, plate_no, car_brand, year, daily_rate, owner, fuel_type, transmission, availability, description) VALUES (?,?,?,?,?,?,?,?,?,?)";
        $add_stmt = $conn->prepare($add);
        $add_stmt->bind_param("sssidsssis", $model, $plate, $brand, $year, $rate, $owner, $fuel, $trans, $availability, $desc);
        $add_stmt->execute();
        $new_car_id = $conn->insert_id;
        $add_stmt->close();

        $target_dir = "../../vnm-system1/php/cars/uploads/cars/";

        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0777, true);
        }

        $main_image_filename = null;

        for($slot = 1; $slot<=4; $slot++ ){
            $fileKey = 'car_image_' . $slot;

            if(isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error']===0){
                $file_name = $_FILES[$fileKey]['name'];
                $file_tmp = $_FILES[$fileKey]['tmp_name'];

                $unique_name = time() . "_" . $slot . "_" . basename($file_name);

                if (move_uploaded_file($file_tmp, $target_dir . $unique_name)) {
                    $insert_img = "INSERT INTO car_images (car_id, image_path) VALUES (?, ?)";
                    $img_stmt = $conn->prepare($insert_img);
                    $img_stmt->bind_param("is", $new_car_id, $unique_name);
                    $img_stmt->execute();
                    $img_stmt->close();

                    if ($slot === 1) {
                        $main_image_filename = $unique_name;
                    }
                }
            }
        }

        if ($main_image_filename !== null) {
            $update_main_img = "UPDATE cars SET image = ? WHERE car_id = ?";
            $main_img_stmt = $conn->prepare($update_main_img);
            $main_img_stmt->bind_param("si", $main_image_filename, $new_car_id);
            $main_img_stmt->execute();
            $main_img_stmt->close();
        }
        echo json_encode(["status" => "success", "message" => "Vehicle and all image records added successfully!"]);
        exit();
    }
}
?>