import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export function Return_Form() {
    const nav = useNavigate();
    const location = useLocation();
    const data = location.state;

    const [condition, setCondition] = useState("");
    const [odometer, setOdometer] = useState("");
    const [damage, setDamage] = useState("");

    const dailyRate = parseFloat(data.daily_rate) || 0;
    const totalCost = parseFloat(data.total_cost) || 0;
    const amountPaid = parseFloat(data.amount_paid) || 0;
    const nonRefundable = totalCost * 0.50;

    const [y, m, d] = data.rental_date.split("-").map(Number);
    const pickupDate = new Date(y, m - 1, d);
    const today = new Date();
    
    const timeDiff = today - pickupDate;
    const daysUsed = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

    const scheduledReturnDays = parseInt(data.rental_duration_days) || 0;
    const scheduledReturnDate = new Date(y, m - 1, d + scheduledReturnDays);
    const daysLate = Math.max(0, Math.floor((today - scheduledReturnDate) / (1000 * 60 * 60 * 24)));

    const usageFee = daysUsed * dailyRate;
    const totalDeduction = Math.max(usageFee, nonRefundable);
    const estimatedRefund = Math.max(0, amountPaid - totalDeduction);
    
    const lateFeeAmount = daysLate * dailyRate;

    const isEarlyReturn = data.request_status === "Early Return Approved";
    const isLateReturn = data.request_status === "Late Return Approved";
    
    const totalAmountDue = isLateReturn ? (totalCost + lateFeeAmount) : (totalCost - parseFloat(data.total_deducted_cost || 0));

    const endRental = async (e) => {
        e.preventDefault();

        try {
            const endRentalRequest = await axios.post("http://localhost/mlt-admin/back/lifecycle.php", {
                requestID: data.request_id,
                action: "End Rental",
                condition: condition,
                odometer: odometer,
                damage: damage,
                refund: isEarlyReturn ? estimatedRefund : 0 
            });

            if (endRentalRequest.data.stat) {
                alert("Rental Closed")
                nav('/')
            } else {
                alert("Server Error")
            }
        } catch (error) {
            alert("Server Error")
        }
    }

    console.log("--- MATH AUDIT ---");
const debugDailyRate = parseFloat(data.daily_rate);
const debugDaysUsed = daysUsed;
const debugUsageFee = debugDailyRate * debugDaysUsed;
const debugNonRefundable = parseFloat(data.total_cost) * 0.50;

console.log("1. Daily Rate:", debugDailyRate);
console.log("2. Days Used:", debugDaysUsed);
console.log("3. Calculated Usage Fee:", debugUsageFee); // This should show up now!
console.log("4. Non-Refundable Penalty (50%):", debugNonRefundable);
console.log("5. Deduction (Max of 3 & 4):", Math.max(debugUsageFee, debugNonRefundable));
console.log("6. Final Refund (AmountPaid - Deduction):", parseFloat(data.amount_paid) - Math.max(debugUsageFee, debugNonRefundable));
console.log("------------------");

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
                        <p className="text-lg"><b>Original Rental Cost: </b>₱{totalCost.toFixed(2)}</p>
                        <p className="text-lg"><b>Late Fee: </b>₱{lateFeeAmount.toFixed(2)}</p>
                        <p className="text-lg"><b>Total Amount Due: </b>₱{totalAmountDue.toFixed(2)}</p>
                    </>
                ) : (
                    <p className="text-lg"><b>Estimated Refund: </b>₱{estimatedRefund.toFixed(2)}</p>
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