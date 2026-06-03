import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "./config";
import { PopUp } from "./modal";

export function HandOverForm(){

    const [popUpData, setPopUpData] = useState(null)

    const nav = useNavigate()

    const location = useLocation()
    const data = location.state

    const [note, setNote] = useState("")
    const [odom, setOdom] = useState("")

    const startRental = async (e, onComplete) =>{
        e.preventDefault()

        try {
            const sendConfirmation = await axios.post(`${API_BASE_URL}/back/lifecycle.php`, {
                requestID: data.request_id,
                action: "Pick Up",
                odometer: odom,
                notes: note
            })
            if(sendConfirmation.data.stat){
                onComplete("Hand Over Successful")
            } else {
                alert ("Error")
            }
        } catch (error) {
            alert("Error occurred while starting rental")
        }
    }

    return(
        <>
        <PopUp data={popUpData} setData={setPopUpData}
        action={(id, actionType, onComplete) => {
        startRental({ preventDefault: () => {} }, onComplete)}}
        result={(res) => setPopUpData(res)}/>
        <div className="card shadow-sm m-2.5">
            <div className="card-body">
                <h1 className="card-title text-2xl font-bold mb-5">
                    Vehicle Pickup Information
                </h1>
                <hr className="mb-5"/>
                <p className="text-lg"><b>Renter:</b> {data.fullname}</p>
                <p className="text-lg"><b>Vehicle:</b> {data.model}, {data.plate_no}</p>
                <p className="text-lg mb-5"><b>Scheduled Pickup:</b> {data.rental_date}</p>
                <hr className="mb-5"/>
                
                <form onSubmit={startRental} className="flex flex-col">
                    <label htmlFor="odometer" className="text-lg font-bold">Odometer Reading:</label>
                    <input type="number" name="odometer" id="odometer" required min={1} value={odom} onChange={(e)=>setOdom(e.target.value)} className="input input-primary w-full mb-2.5"/>

                    <label htmlFor="notes" className="text-lg font-bold">Notes: </label>
                    <textarea name="notes" id="notes" placeholder="Type Here" required value={note} onChange={(e)=>setNote(e.target.value)} className="textarea w-full textarea-primary mb-5"></textarea>

                    <button type="button" className="btn btn-primary"
                    onClick={()=>{
                        setPopUpData({
                            msg: "Confirm hand over and start rental?",
                            type: "green",
                            id: data.request_id,
                            action: "Confirm Hand Over"
                        })
                    }}
                    >
                        Confirm Hand Over
                    </button>
                </form>
            </div>
        </div>
        </>
    )

}