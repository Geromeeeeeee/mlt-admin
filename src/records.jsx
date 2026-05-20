import { useState, useEffect } from "react";
import axios from "axios";

export function useRecords (){
    const [records, setRecords] = useState([])
    const [returns, setReturns] = useState([])
    const [vehicles, setVehicles] = useState([])

    const getRecords = async () => {
        try {
            const response = await axios.post("http://localhost/mlt-admin/back/api.php", {
                action: "getRequests"
            })
            setRecords(response.data)
        } catch (error) {
            alert("Server Error")
        }
    }

    const getReturn = async () =>{
        try {
            const returnRequests = await axios.post("http://localhost/mlt-admin/back/api.php", {
                action: "getReturnRequests"
            })
            setReturns(returnRequests.data)
        } catch (error) {
            alert("Server Error")
        }
    }

    const buttonAction = async (id, actionType) =>{
        try {
            await axios.post("http://localhost/mlt-admin/back/lifecycle.php", {
                requestID: id,
                action: actionType
            })
            await getRecords()
            await getReturn()
            alert(`${actionType} Successful`)
        } catch (error) {
            alert(`${actionType} Failed`)
        }
    }

    const getVehicles = async () => {
        try {
            const vehicleDetails = await axios.post("http://localhost/mlt-admin/back/vehicles.php", {
                action: "getVehicles"
            })
            setVehicles(vehicleDetails.data)
        } catch (error) {
            alert("Server Error")
        }
    }

    const updateVehicles = async (
        formData,
        imgs = { 1: null, 2: null, 3: null, 4: null },
        deletedImgs = [],
        existingImages = []
    ) => {
        try {
            if (!formData) {
                throw new Error("Missing form data");
            }
            
            const safeImgs = (imgs && typeof imgs === "object" && !Array.isArray(imgs))
                ? imgs
                : { 1: null, 2: null, 3: null, 4: null };
                
            const safeDeletedImgs = Array.isArray(deletedImgs) ? deletedImgs : [];
            const safeExistingImages = Array.isArray(existingImages) ? existingImages : [];

            const updateDetails = new FormData()
            updateDetails.append("action", "updateVehicles")
            updateDetails.append("id", formData.id)
            updateDetails.append("model", formData.model)
            updateDetails.append("plate", formData.plate)
            updateDetails.append("rate", formData.rate)
            updateDetails.append("owner", formData.owner)
            updateDetails.append("desc", formData.desc)
            updateDetails.append("availability", formData.availability)

            Object.keys(safeImgs).forEach((slotNumber) => {
                const file = safeImgs[slotNumber];
                if (file) {
                    updateDetails.append(`car_image_${slotNumber}`, file);
                }
            })

            for (let slot = 1; slot <= 4; slot++) {
                const isDeleted = safeDeletedImgs.includes(slot);
                const oldImageName = safeExistingImages[slot - 1];
                const hasNewFile = safeImgs ? safeImgs[slot] : null;

                if (oldImageName && !isDeleted && !hasNewFile) {
                    updateDetails.append(`existing_images_${slot}`, oldImageName);
                }
            }

            const updatedVehicleDetails = await axios.post("http://localhost/mlt-admin/back/vehicles.php", updateDetails)
            await getVehicles()
            alert("Updates Successfully")
            return true
        } catch (error) {
            const errorMsg = error.response?.data?.message
                || error.response?.data
                || error.message
                || "Server Error";
            console.error("Update error:", error);
            alert(errorMsg)
            return false
        }
    }

    useEffect(()=>{
        getRecords()
        getReturn()
        getVehicles()
    },[])

    return{records, returns, vehicles , getVehicles, updateVehicles ,getReturn ,getRecords, buttonAction}
}