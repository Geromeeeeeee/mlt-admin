import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Table ({type, list, action}) {

    const todayStr = new Date().toISOString().split('T')[0];

    const nav = useNavigate()

    const [selectedImg, setSelectedImg] = useState(null);

    return(
        <div className="p-5">
            {/**View license / payment proof. dito q ginaya yung sa vehicle table */}
            {/**Bakit ganito yung comment tapos kapag nasa loob ng map iba? dahil ba sa curly braces? */}
            {selectedImg && (
                <div className="modal modal-open bg-black/60" onClick={() => setSelectedImg(null)}>
                    <div className="modal-box relative max-w-3xl bg-base-100 p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <button 
                            className="btn btn-sm btn-circle absolute right-2 top-2 z-10" 
                            onClick={() => setSelectedImg(null)}
                        >✕</button>
                        
                        <img 
                            src={selectedImg} 
                            alt="Document" 
                            className="w-full h-auto object-contain max-h-[80vh]" 
                        />
                    </div>
                </div>
            )}
            <h1 className="text-xl font-bold mb-2.5">{type}</h1>
            <div className="overflow-x-auto shadow-sm">
            <table className="table table-zebra bg-base-100">
                <thead>
                    <tr>
                        {type !== "Return Requests" && (
                        <>
                        <th>Renter</th>
                        <th>Vehicle</th>
                        <th>License</th>
                        <th>Payment Proof</th>
                        <th>Reference No.</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Duration</th>
                        <th>Cost</th>
                        <th>Status</th>
                        <th>Notes</th>
                        <th>Action</th>
                        </>
                        )}
                        {type === "Return Requests" && (
                        <>
                        <th>Renter</th>
                        <th>Vehicle</th>
                        <th>Cost</th>
                        <th>Final Charge</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                        </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {list.length === 0 ? (
                        <>
                        <tr>
                            <td className="text-center" colSpan={12}>Nothing To Show</td>
                        </tr>
                        </>
                    ) : (
                        list.map((requests, index)=>{
                        const id = requests.request_id

                        //Date formatting para sa late and early returns for their refunds saka late fees
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        let lateFeeAmount = 0;
                        let daysLate = 0;

                        if (requests.rental_date && requests.rental_duration_days) {
                            const [year, month, day] = requests.rental_date.split("-").map(Number);
                            const scheduledReturnDate = new Date(year, month - 1, day);
                            scheduledReturnDate.setHours(0, 0, 0, 0);

                            const durationDays = parseInt(requests.rental_duration_days, 10);
                            const daysToAdd = durationDays > 0 ? durationDays - 1 : 0;
                            
                            scheduledReturnDate.setDate(scheduledReturnDate.getDate() + daysToAdd);
                            scheduledReturnDate.setHours(0, 0, 0, 0);

                            const actualReturnStr = requests.requested_at ? requests.requested_at.split(" ")[0] : null;

                            if (actualReturnStr) {
                                const [retYear, retMonth, retDay] = actualReturnStr.split("-").map(Number);
                                const actualReturnDate = new Date(retYear, retMonth - 1, retDay);
                                actualReturnDate.setHours(0, 0, 0, 0);

                                const timeDiff = actualReturnDate.getTime() - scheduledReturnDate.getTime();
                                daysLate = timeDiff > 0 ? Math.floor(timeDiff / (1000 * 60 * 60 * 24)) : 0;
                                lateFeeAmount = daysLate * parseFloat(requests.daily_rate || 0);
                            }
                        }

                        //Different button types depende sa rental status, kung late, early, or on time ba sha
                        let actionButton
                        if(type==="Active Rental Requests"){
                            actionButton = (
                                <button className="btn btn-primary">
                                    Manage Rental
                                </button>
                            )
                        } else if (type === "Pending Rental Requests"){
                            if(requests.request_status === "Pending"){
                                actionButton = (
                                    <button className="btn btn-primary" onClick={()=> action(id, "Approve")}>
                                        Approve
                                    </button>
                                )
                            } else if (requests.request_status === "Approved" && requests.payment_status === "Unpaid"){
                                actionButton = (
                                    <button className="btn btn-primary w-fit h-fit">
                                        No payment proof
                                    </button>
                                )
                            } else if (requests.request_status === "Approved" && requests.payment_status === "Proof Uploaded"){
                                actionButton = (
                                    <button className="btn btn-primary" onClick={()=> action(id, "Payment")}>
                                        Verify Payment
                                    </button>
                                )
                            }
                        } else if (type === "Approved Rentals"){

                            const disableButton = requests.rental_date !== todayStr;

                            actionButton = (
                                <button className="btn btn-primary" disabled={disableButton} onClick={()=>nav("/Vehicle Pickup", {state: requests})}>
                                    Hand Over
                                </button>
                            )
                        }

                        return(
                        <tr key={requests.request_id || index}>
                            {type!=="Return Requests" && (
                                <>
                                <td className="font-bold">{requests.fullname}</td>
                                <td className="w-fit">{requests.model}, {requests.plate_no}</td>
                                <td>{requests.driver_license_photo ? (
                                    <button 
                                        className="btn btn-sm btn-info text-white"
                                        onClick={() => setSelectedImg(`http://localhost/vnm-system1/${requests.driver_license_photo}`)}
                                    >
                                        License
                                    </button>
                                ) : "No File"}
                                </td>
                                <td>{requests.payment_proof_path ? (
                                    <button 
                                        className="btn btn-sm btn-info text-white"
                                        onClick={() => setSelectedImg(`http://localhost/vnm-system1/${requests.payment_proof_path}`)}
                                    >
                                        Payment Proof
                                    </button>
                                ) : "..."}
                                </td>
                                <td>{requests.payment_reference_no}</td>
                                <td>{requests.rental_date}</td>
                                <td>{requests.rental_time}</td>
                                <td>{requests.rental_duration_days}</td>
                                <td>{requests.total_cost}</td>
                                <td>{requests.request_status}</td>
                                <td>{requests.admin_notes ? (
                                    requests.admin_notes
                                ):(
                                    "..."
                                )}</td>
                                <td>{actionButton}</td>
                                </>
                            )}
                            {type === "Return Requests" && (
                                <>
                                <td className="font-bold">{requests.fullname}</td>
                                <td className="w-fit">{requests.model}, {requests.plate_no}</td>
                                <td>{requests.total_cost}</td>
                                <td>
                                    {(() => {
                                    const isEarly = requests.request_status === "Early Return Approved";
                                    const isLate = requests.request_status === "Late Return Approved";
                                    
                                    const cost = parseFloat(requests.total_cost || 0);
                                    const deducted = parseFloat(requests.total_deducted_cost || 0);

                                    if (isEarly) {
                                        return (
                                            <span className="text-success font-semibold">
                                                {deducted} (Early)
                                            </span>
                                        );
                                    } else if (isLate && lateFeeAmount > 0) {
                                        const totalWithLateFee = cost + lateFeeAmount;
                                        return (
                                            <div className="flex flex-col">
                                                <span className="text-error font-bold">
                                                    {totalWithLateFee}
                                                </span>
                                                <span className="text-xs text-error/80">
                                                    ({lateFeeAmount} penalty)
                                                </span>
                                            </div>
                                        );
                                    } else {
                                        return <span>{cost}</span>;
                                    }
                                })()}
                                </td>
                                <td>{requests.requested_at}</td>
                                <td>{requests.request_status}</td>
                                <td>
                                    {requests.status==="Approved" ? (
                                    <button className="btn btn-sm btn-info text-white" onClick={()=>nav("/Return Vehicle", {state: requests})}>
                                        Return Form
                                    </button>
                                    ) : (
                                    <button className="btn btn-sm btn-info text-white" onClick={()=> action(id, "Approve Return")}>
                                    Approve
                                    </button>
                                    )}
                                </td>
                                </>
                            )}
                        </tr>
                        )
                        })
                    )}
                </tbody>
            </table>
            </div>
        </div>
    )
}