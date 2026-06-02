import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "./config";

export function Return_Form() {
    const nav = useNavigate()
    const location = useLocation()
    const data = location.state

    const [condition, setCondition] = useState("")
    const [odometer, setOdometer] = useState("")
    const [damage, setDamage] = useState("")

    const totalCost = parseFloat(data.total_cost) || 0
    const lateFee = parseFloat(data.calc_late_fee) || 0

    const [y, m, d] = data.rental_date.split("-").map(Number)
    const pickupDate = new Date(y, m - 1, d)
    pickupDate.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const requestedAtStr = data.requested_at ? data.requested_at.split(" ")[0] : null
    const actualReturnDate = requestedAtStr
        ? new Date(requestedAtStr)
        : new Date(today)
    actualReturnDate.setHours(0, 0, 0, 0)
    
    const timeDiff = actualReturnDate.getTime() - pickupDate.getTime()
    const daysUsed = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))

    const scheduledReturnDays = parseInt(data.rental_duration_days, 10) || 0
    const daysToAdd = scheduledReturnDays > 0 ? scheduledReturnDays - 1 : 0
    const scheduledReturnDate = new Date(y, m - 1, d + daysToAdd)
    scheduledReturnDate.setHours(0, 0, 0, 0)

    const lateTimeDiff = actualReturnDate.getTime() - scheduledReturnDate.getTime()
    const daysLate = Math.max(0, Math.floor(lateTimeDiff / (1000 * 60 * 60 * 24)))

    const isEarlyReturn = data.request_status === "Early Return Approved" || data.request_status === "Early Return Requested";
    
    const isLateReturn = data.request_status === "Late Return Approved" || data.request_status === "Late Return Requested" || daysLate > 0;
    
    const totalAmountDue = isLateReturn 
        ? (totalCost + lateFee) 
        : Math.max(0, totalCost - parseFloat(data.total_deducted_cost || 0));

    const endRental = async (e) => {
        e.preventDefault();

        try {
            const endRentalRequest = await axios.post(`${API_BASE_URL}/back/lifecycle.php`, {
                requestID: data.request_id,
                action: "End Rental",
                condition: condition,
                odometer: odometer,
                damage: damage,
            });

            if (endRentalRequest.data.stat) {
                alert("Rental Closed")
                nav('/Rentals')
            } else {
                alert("Server Error")
            }
        } catch (error) {
            alert("Server Error")
        }
    }

    return (
        <div className="card shadow-sm m-2.5">
            <div className="card-body">
                <h1 className="card-title text-2xl font-bold mb-5">Vehicle Return Form</h1>
                <hr className="mb-5" />
                <p className="text-lg"><b>Renter:</b> {data.fullname}</p>
                <p className="text-lg"><b>Vehicle:</b> {data.model}, {data.plate_no}</p>
            
                {isLateReturn ? (
                    <>
                        <p className="text-lg"><b>Days Late: </b>{daysLate}</p>
                        <p className="text-lg"><b>Original Rental Cost: </b>₱{data.total_cost}</p>
                        <p className="text-lg"><b>Late Fee: </b>₱{data.calc_late_fee}</p>
                        <p className="text-lg"><b>Total Amount Due: </b>₱{totalAmountDue.toFixed(2)}</p>
                    </>
                ) : (
                    <p className="text-lg"><b>Estimated Refund: </b>₱{data.calc_refund}</p>
                )}
                
                <hr className="mb-5" />
                
                <form className="flex flex-col" onSubmit={endRental}>
                    <label htmlFor="odometer" className="text-lg font-bold">Odometer Reading:</label>
                    <input type="number" name="odometer" id="odometer" required min={1} value={odometer} onChange={(e) => setOdometer(e.target.value)} className="input input-primary w-full mb-2.5"/>

                    <label htmlFor="damage" className="text-lg font-bold">Damage Fee:</label>
                    <input type="number" name="damage" id="damage" required value={damage} onChange={(e) => setDamage(e.target.value)} className="input input-primary w-full mb-2.5"/>

                    <label htmlFor="notes" className="text-lg font-bold">Car Condition upon return: </label>
                    <textarea name="notes" id="notes" placeholder="Type Here" required value={condition} onChange={(e) => setCondition(e.target.value)} className="textarea w-full textarea-primary mb-5"></textarea>

                    <button type="submit" className="btn btn-primary">Confirm</button>
                </form>
            </div>
        </div>
    )
}