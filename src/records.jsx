import { useState, useEffect } from "react";
import axios from "axios";

export function useRecords (){
    const [records, setRecords] = useState([])
    const [returns, setReturns] = useState([])

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

    useEffect(()=>{
        getRecords()
        getReturn()
    },[])

    return{records, returns, getReturn ,getRecords, buttonAction}
}