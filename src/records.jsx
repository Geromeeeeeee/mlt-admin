import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "./config";

export function useRecords (){
    const [records, setRecords] = useState([])
    const [returns, setReturns] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [users, setUsers] = useState([])
    const [finalCost, setFinalCost] = useState([])
    const [extensions, setExtensions] = useState([])

    const getRecords = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/back/api.php`, {
                action: "getRequests"
            })
            setRecords(response.data)
        } catch (error) {
            alert("Server Error")
        }
    }

    const getExtensions = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/back/api.php`, {
                action: "getExtensionRequests"
            });
            setExtensions(response.data);
        } catch (error) {
            console.error("Error fetching extensions:", error);
        }
    }

    const getReturn = async () =>{
        try {
            const returnRequests = await axios.post(`${API_BASE_URL}/back/api.php`, {
                action: "getReturnRequests"
            })
            setReturns(returnRequests.data)
        } catch (error) {
            alert("Server Error")
        }
    }

    const buttonAction = async (id, actionType, onComplete) =>{
        try {
            const response = await axios.post(`${API_BASE_URL}/back/lifecycle.php`, {
                requestID: id,
                action: actionType
            })
            await getRecords()
            await getReturn()
            setFinalCost(response.data.final_cost)
            const message = (`${actionType} Successful`)
            if(onComplete) onComplete(message)
        } catch (error) {
            alert(`${actionType} Failed`)
        }
    }

    const getVehicles = async () => {
        try {
            const vehicleDetails = await axios.post(`${API_BASE_URL}/back/vehicles.php`, {
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

            const updatedVehicleDetails = await axios.post(`${API_BASE_URL}/back/vehicles.php`, updateDetails)
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

    const addVehicle = async (vehicleData, imgs) => {
        try {
            if(!vehicleData) alert("Missing Information")
            
            const vehicleDetails = new FormData()

            vehicleDetails.append("action", "addVehicle")
            vehicleDetails.append("model", vehicleData.model)
            vehicleDetails.append("plate", vehicleData.plate)
            vehicleDetails.append("brand", vehicleData.brand)
            vehicleDetails.append("year", vehicleData.year)
            vehicleDetails.append("rate", vehicleData.rate)
            vehicleDetails.append("owner", vehicleData.owner)
            vehicleDetails.append("fuel", vehicleData.fuel)
            vehicleDetails.append("trans", vehicleData.trans)
            vehicleDetails.append("desc", vehicleData.desc)
            vehicleDetails.append("availability", vehicleData.availability)

            const safeImgs = (imgs && typeof imgs === "object" && !Array.isArray(imgs))
                ? imgs
                : { 1: null, 2: null, 3: null, 4: null }

            Object.keys(safeImgs).forEach((slotNumber) => {
                const file = safeImgs[slotNumber]
                if (file) {
                    vehicleDetails.append(`car_image_${slotNumber}`, file)
                }
            })

            const response = await axios.post(`${API_BASE_URL}/back/vehicles.php`, vehicleDetails)

            await getVehicles()
            alert("Vehicle Added Successfully")
            return true
        } catch (error) {
            alert ("Error adding vehicle")
            return false
        }
    }

    const manageUsers = async (userAction, userID) => {
        try {
            const uID = userID ?? null
            const userDetails = await axios.post(`${API_BASE_URL}/back/users.php`, {
                action: userAction,
                uid: uID
            })
            const refreshUsers = await axios.post(`${API_BASE_URL}/back/users.php`, {
                action: "getUsers"
            })
            setUsers(refreshUsers.data)
            
        } catch (error) {
            alert("Server Error")
        }
    }

    useEffect(()=>{
        getRecords()
        getReturn()
        getVehicles()
        getExtensions()
    },[])

    return{records, returns, extensions,vehicles, addVehicle ,getVehicles, updateVehicles ,getReturn ,getRecords, manageUsers, users ,buttonAction, finalCost}
}