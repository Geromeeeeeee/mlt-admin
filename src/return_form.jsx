import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export function Return_Form(){
    const nav = useNavigate()

    const location = useLocation()
    const data = location.state

    const [condition, setCondition] = useState("")
    const [odometer, setOdometer] = useState("")
    const [damage, setDamage] = useState("")
    const [refund, setRefund] = useState("")

    const earlyReturn = data.request_status === "Early Return Approved"
    const lateReturn = data.request_status === "Late Return Approved"
    const finalAmount = parseFloat(data.total_cost) - parseFloat(data.total_deducted_cost)
    const refundAmount = earlyReturn ? parseFloat(data.total_cost) - finalAmount : 0

    const [y, m, d] = data.rental_date.split("-").map(Number);
    const scheduledReturn = new Date(y, m - 1, d + (parseInt(data.rental_duration_days) || 0)).setHours(0,0,0,0);

    const actualReturnStr = data.requested_at ? data.requested_at.split(" ")[0] : null;
    let daysLate = 0;

    if (actualReturnStr) {
        const [retY, retM, retD] = actualReturnStr.split("-").map(Number);
        const actualReturnTime = new Date(retY, retM - 1, retD).setHours(0,0,0,0);
        
        daysLate = Math.max(0, Math.floor((actualReturnTime - scheduledReturn) / 86400000));
    }

    const lateFeeAmount = daysLate * (parseFloat(data.daily_rate) || 0);
    const totalAmount = lateReturn ? (parseFloat(data.total_cost) || 0) + lateFeeAmount : finalAmount;

    const endRental = async (e) =>{
        e.preventDefault()

        try {
            const endRentalRequest = await axios.post("http://localhost/mlt-admin/back/lifecycle.php", {
                requestID: data.request_id,
                action: "End Rental",
                condition: condition,
                odometer: odometer,
                damage: damage,
                refund: earlyReturn ? refundAmount : 0
            })

            if (endRentalRequest.data.stat){
                alert("Rental Closed")
                nav('/')
            } else {
                alert("Server Error")
            }
        } catch (error) {
            alert("Server Error")
        }
    }
    return(
       <>
        <div className="card shadow-sm m-2.5">
            <div className="card-body">
                <h1 className="card-title text-2xl font-bold mb-5">
                    Vehicle Return Form
                </h1>
                <hr className="mb-5"/>
                <p className="text-lg"><b>Renter:</b> {data.fullname}</p>
                <p className="text-lg"><b>Vehicle:</b> {data.model}, {data.plate_no}</p>
                {lateReturn ? (
                    <>
                    <p className="text-lg"><b>Days Late: </b>{daysLate}</p>
                    <p className="text-lg"><b>Original Rental Cost: </b>{data.total_cost}</p>
                    <p className="text-lg"><b>Late Fee: </b>{lateFeeAmount}</p>
                    <p className="text-lg"><b>Total Amount Due: </b>{totalAmount}</p>
                    </>
                    ):(
                    <p className="text-lg"><b>Refund Amount: </b>{refundAmount}</p>
                    )}
                <hr className="mb-5"/>
                
                <form className="flex flex-col" onSubmit={endRental}>
                    <label htmlFor="odometer" className="text-lg font-bold">Odometer Reading:</label>
                    <input type="number" name="odometer" id="odometer" required min={1} value={odometer} onChange={(e)=>setOdometer(e.target.value)} className="input input-primary w-full mb-2.5"/>

                    <label htmlFor="damage" className="text-lg font-bold">Damage Fee:</label>
                    <input type="number" name="damage" id="damage" required value={damage} onChange={(e)=>setDamage(e.target.value)} className="input input-primary w-full mb-2.5"/>

                    <label htmlFor="notes" className="text-lg font-bold">Car Condition upon return: </label>
                    <textarea name="notes" id="notes" placeholder="Type Here" required value={condition} onChange={(e)=>setCondition(e.target.value)} className="textarea w-full textarea-primary mb-5"></textarea>

                    <button type="submit" className="btn btn-primary">
                        Confirm
                    </button>
                </form>
            </div>
        </div>
        </>
    )
}