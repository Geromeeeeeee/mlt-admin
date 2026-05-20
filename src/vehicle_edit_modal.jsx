import { useState } from "react"

export function Vehicle_Edit_Modal ({vehicle, onClose, getVehicles, updateVehicles}){

    const [imgs, setImgs] = useState({
        1:null,
        2:null,
        3:null,
        4:null
    })
    const [deletedImgs, setDeteledImgs] = useState([])
    const existingImages = vehicle.all_images ? vehicle.all_images.split(",") : []
    const handleImageChange = (imgNumber, file) => {
        if (file) {
            setImgs(prev => ({ ...prev, [imgNumber]: file }))
            setDeteledImgs(prev => prev.filter(number => number !== imgNumber))
        }
    }
    const handleClearImgs = (imgNumber) => {
        setImgs(prev => ({ ...prev, [imgNumber]: null }))
        setDeteledImgs(prev => [...prev, imgNumber])
    }
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

        const success = await updateVehicles(formData, imgs, deletedImgs, existingImages)

        if(success){
            await getVehicles()
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

                    <label className="text-md font-semibold mb-2">Vehicle Images (Max 4 Slots)</label>
                    <div className="grid grid-cols-2 gap-4 mb-3.5">
                        {[1, 2, 3, 4].map((slot) => {
                            const existingImg = existingImages[slot - 1]
                            const newFile = imgs[slot]
                            const isMarkedDeleted = deletedImgs.includes(slot)

                            return (
                                <div key={slot} className="border border-neutral-200 rounded-lg p-2 flex flex-col items-center bg-base-100 relative">
                                    <span className="absolute top-1 left-2 text-xs font-bold opacity-30">Slot {slot}</span>
                                    
                                    {newFile ? (
                                        <img src={URL.createObjectURL(newFile)} alt="preview" className="w-full h-24 object-cover rounded mb-2" />
                                    ) : (existingImg && !isMarkedDeleted) ? (
                                        <img src={`http://localhost/vnm-system1/php/cars/uploads/cars/${existingImg}`} alt="current" className="w-full h-24 object-cover rounded mb-2" />
                                    ) : (
                                        <div className="w-full h-24 border border-dashed border-neutral-300 rounded flex items-center justify-center text-xs text-neutral-400 mb-2 bg-neutral-50">
                                            Empty Slot
                                        </div>
                                    )}

                                    <div className="flex gap-1 w-full mt-auto">
                                        <label className="btn btn-xs btn-primary flex-1 text-center cursor-pointer">
                                            {existingImg || newFile ? "Replace" : "Upload"}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => handleImageChange(slot, e.target.files[0])} 
                                            />
                                        </label>
                                        
                                        {(existingImg || newFile) && !isMarkedDeleted && (
                                            <button type="button" onClick={() => handleClearImgs(slot)} className="btn btn-xs btn-error text-white">
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

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