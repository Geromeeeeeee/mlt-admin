import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function Table ({type, list, action}) {

    const todayStr = new Date().toISOString().split('T')[0];

    const nav = useNavigate()

    const [selectedImg, setSelectedImg] = useState(null);

    return(
        <div className="p-5">
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
                                <td>{parseFloat(requests.total_cost) - parseFloat(requests.total_deducted_cost)}</td>
                                <td>{requests.requested_at}</td>
                                <td>{requests.request_status}</td>
                                <td>
                                    {requests.status==="Approved" ? (
                                    <button className="btn btn-sm btn-info text-white">
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