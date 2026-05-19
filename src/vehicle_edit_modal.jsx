import { useState } from "react"
import { useRecords } from "./records"

export function Vehicle_Edit_Modal ({vehicle, onClose}){

    const {updateVehicles} = useRecords()
    const [formData, setFormData] = useState({
        id: vehicle.car_id,
        model: vehicle.model,
        plate: vehicle.plate_no,
        rate: vehicle.daily_rate,
        owner: vehicle.owner,
        desc: vehicle.description,
        availability: vehicle.availability
    })
    const editFormData = (e) => {
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()

        const success = await updateVehicles(formData)

        if(success){
            onClose()
        }
    }

    return(
        <>
        <div className="modal modal-open bg-black/40 fixed inset-0 z-50" onClick={onClose}>
            <div className="modal-box modal-middle z-20 max-h-[85vh]" onClick={e=>e.stopPropagation()}>
                <h1 className="text-xl font-bold mb-2.5">Edit Vehicle Information</h1>
                <hr className="mb-5 border-neutral-300 w-full"/>
                <form className="flex flex-col w-full overflow-y-auto" onSubmit={handleSubmit}>
                    <label htmlFor="model" className="text-md font-semibold">Model</label>
                    <input type="text" name="model" id="model" value={formData.model} onChange={editFormData} className="input input-primary w-full mb-2.5"/>

                    <label htmlFor="plate" className="text-md font-semibold">Plate No.</label>
                    <input type="text" name="plate" id="plate" value={formData.plate} onChange={editFormData}className="input input-primary w-full mb-2.5"/>

                    <label htmlFor="rate" className="text-md font-semibold">Daily Rate</label>
                    <input type="number" name="rate" id="rate" value={formData.rate} onChange={editFormData}className="input input-primary w-full mb-2.5"/>

                    <label htmlFor="owner" className="text-md font-semibold">Owner</label>
                    <input type="text" name="owner" id="owner" value={formData.owner} onChange={editFormData}className="input input-primary w-full mb-2.5"/>

                    <label htmlFor="desc" className="text-md font-semibold">Description</label>
                    <textarea name="desc" id="desc" className="textarea textarea-primary w-full mb-2.5" value={formData.desc} onChange={editFormData}></textarea>

                    <label htmlFor="availability" className="text-md font-semibold">Availability</label>
                    <select name="availability" id="availability" className="select select-primary w-full mb-5" value={formData.availability} onChange={editFormData}>
                        <option value="1">Available</option>
                        <option value="0">Unavailable</option>
                    </select>

                    <button type="submit" className="btn btn-primary">Confirm Changes</button>
                </form>
            </div>
        </div>
        </>
    )
}