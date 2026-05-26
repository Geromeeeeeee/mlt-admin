import { useState, useRef } from "react";
import { Vehicle_Edit_Modal } from "./vehicle_edit_modal";
import { Add_Vehicle } from "./add_vehicle_modal";
import { useRecords } from "./records";
import { API_BASE_URL } from "./config";

export function Vehicle_Table ({details, getVehicles, updateVehicles}){

    const { addVehicle: addVehicleHook } = useRecords()
    const [carDisp, setCarDisp] = useState(null)
    const scrollRef = useRef(null)
    const [editVehicle, setEditVehicle] = useState(null)
    const [search, setSearch] = useState("")
    const [addVehicle, setAddVehicle] = useState(false)

    return(
        <>
        <div className="p-5">
            {/**View Images button functions eme eme. ni copy ko lang sha table.jsx hehe */}
        {carDisp && (
        <div className="modal modal-open bg-black/60" onClick={() => setCarDisp(null)}>
            <div className="w-[75vw] h-fit bg-white p-2.5 rounded-lg flex flex-col items-center justify-start relative [&::-webkit-scrollbar]:hidden" onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm btn-circle btn-error mb-2.5 ml-auto text-white" onClick={() => setCarDisp(null)}>
                    ✕
                </button>
                <div className="flex w-[75vw] h-full overflow-x-scroll snap-x snap-mandatory shrink-0" ref={scrollRef}>
                    {carDisp.all_images ? (
                        carDisp.all_images.split(",").map((img_name,index)=>(
                            <div key={index} className="w-full shrink-0">
                                <img 
                                src={`${API_BASE_URL}/back/Uploads/Cars/${img_name.trim()}`} 
                                alt=""
                                className="w-full h-full object-contain max-h-[80vh] rounded-sm"/>
                            </div>
                        ))
                    ):(
                        null
                    )}
                    
                </div>
                <div className="flex justify-between absolute top-1/2 self-center -translate-y-1/2 w-full p-5">
                    <button className="btn btn-circle btn-accent mb-2.5 text-white" onClick={()=>scrollRef.current.scrollBy({left: -scrollRef.current.offsetWidth, behavior: 'smooth'})}>
                    ←
                    </button>
                    <button className="btn btn-circle btn-accent mb-2.5 text-white" onClick={()=>scrollRef.current.scrollBy({left: scrollRef.current.offsetWidth, behavior: 'smooth'})}>
                        →
                    </button>
                </div>
            </div>
        </div>
        )}

        {editVehicle && (
            <Vehicle_Edit_Modal vehicle={editVehicle} onClose={()=>setEditVehicle(null)} getVehicles={getVehicles} updateVehicles={updateVehicles}/>
        )}
        {addVehicle && (
            <Add_Vehicle onClose={() => setAddVehicle(false)} addVehicle={async (vehicle, vehicleImg) => {
                const success = await addVehicleHook(vehicle, vehicleImg);
                if (success) setAddVehicle(false); // Close modal only if upload succeeds
            }}
            />
        )}

        <h1 className="text-xl font-bold mb-2.5">Manage Vehicles</h1>
        <div className="w-full h-fit flex justify-between mb-2.5">
        <input type="search" name="" id="" placeholder="Search: eg, ABC 123, John Smith, Toyota" className="input input-neutral" onChange={(e)=>setSearch(e.target.value)}/>

        <button className="btn btn-primary" onClick={()=>setAddVehicle(true)}>Add Vehicle</button>
        </div>  
        <table className="table table-zebra table-pin-rows bg-base-100 shadow-sm">
            <thead>
                <tr>
                    <th>Model</th>
                    <th>Image</th>
                    <th>Plate Number</th>
                    <th>Daily Rate</th>
                    <th>Owner</th>
                    <th>Availability</th>
                    <th>Edit</th>
                </tr>
            </thead>
            <tbody>
                {details.length === 0 ? (
                <tr>
                    <td className="text-center text-black/50" colSpan={8}>No vehicles to manage</td>
                </tr>
                ):(
                details?.filter((detail)=>
                    detail.model.toLowerCase().includes(search.toLowerCase()) || 
                    detail.plate_no.toLowerCase().includes(search.toLowerCase()) ||
                    detail.owner.toLowerCase().includes(search.toLowerCase())).map((details, index)=>{
                return(
                    <tr key={index}>
                        <td>{details.model}</td>
                        <td>
                            <button onClick={()=>setCarDisp(details)} className="btn btn-info btn-sm text-white">
                                View Images
                            </button>
                        </td>
                        <td>{details.plate_no}</td>
                        <td>{details.daily_rate}</td>
                        <td>{details.owner}</td>
                        <td>
                            {details.availability === "1" ? (
                                "Available"
                            ):(
                                "Not Available"
                            )}
                        </td>
                        <td>
                            <button className="btn btn-primary btn-sm" onClick={()=>setEditVehicle(details)}>
                                Edit
                            </button>
                        </td>
                    </tr>
                )
                })
                )}
            </tbody>
        </table>
        </div>
        </>
    )
}