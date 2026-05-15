import { useState, useEffect } from "react";
import axios from "axios";

export function useRecords (){
    const [records, setRecords] = useState([])

    const getRecords = async () => {
        try {
            const response = await axios.get("http://localhost/mlt-admin/back/api.php")
            setRecords(response.data)
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
            alert(`${actionType} Successful`)
        } catch (error) {
            alert(`${actionType} Failed`)
        }
    }

    useEffect(()=>{
        getRecords()
    },[])

    return{records, getRecords, buttonAction}
}