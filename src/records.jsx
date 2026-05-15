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

    useEffect(()=>{
        getRecords()
    },[])

    return{records, getRecords}
}