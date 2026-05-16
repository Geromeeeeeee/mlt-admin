import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export function HandOverForm(){

    const nav = useNavigate()

    const location = useLocation()
    const data = location.state

    const [note, setNote] = useState("")
    const [odom, setOdom] = useState("")

    const startRental = async (e) =>{
        e.preventDefault()

        try {
            const sendConfirmation = await axios.post("http://localhost/mlt-admin/back/lifecycle.php", {
                requestID: data.request_id,
                action: "Pick Up",
                odometer: odom,
                notes: note
            })
            if(sendConfirmation.data.stat){
                alert("Pick Up Successful")
                nav('/')
            } else {
                alert ("Error")
            }
        } catch (error) {
            
        }
    }

    return(
        <>
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

                    <button type="submit" className="btn btn-primary">
                        Confirm hand over and start rental
                    </button>
                </form>
            </div>
        </div>
        </>
    )

}