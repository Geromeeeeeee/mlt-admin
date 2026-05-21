import { useState } from "react";

export function Add_Vehicle({onClose, addVehicle}){

    

     const [vehicle, setVehicle] = useState({
        model: "",
        plate: "",
        brand: "",
        year: "",
        rate: "",
        owner: "",
        fuel: "",
        trans: "",
        desc: "",
        availability: "1"
     })

     const [vehicleImg, setVehicleImg] = useState({
        1: null,
        2: null,
        3: null,
        4: null
     })

     const inputChange = (e) => {
        setVehicle({
            ...vehicle,
            [e.target.name]: e.target.value
        })
     }

    const imgInput = (slot, file) => {
        if(file){
            setVehicleImg ((previous)=>({
                ...previous,
                [slot]:file
            }))
        }
     }

     const imgClear = (slot) => {
        setVehicleImg((previous)=>({
            ...previous,
            [slot]:null
        }))
     }

    const handleSubmit = (e)=>{
        e.preventDefault()

        const missingImg = Object.values(vehicleImg).some(img => img === null)
        if(missingImg){
            alert("4 Photos needed")
            return
        }
        if(addVehicle){
            addVehicle(vehicle, vehicleImg)
        }
    }

    return(
        <div className="modal modal-open bg-black/40 fixed inset-0 z-50" onClick={onClose}>
            <div className="modal-box modal-middle z-20 max-h-[85vh] min-w-[45vw]" onClick={e=>e.stopPropagation()}>
                <h1 className="text-xl font-bold mb-2.5">Vehicle Information</h1>
                <hr className="mb-5 border-neutral-300 w-full"/>
                <form className="flex flex-col w-full overflow-y-auto" onSubmit={handleSubmit}>
                    <label htmlFor="model" className="text-md font-semibold">Model</label>
                    <input type="text" name="model" id="model" className="input input-primary w-full mb-2.5" onChange={inputChange} required/>

                    <label htmlFor="images" className="text-md font-semibold">Images</label>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        {[1,2,3,4].map((slot)=>{
                            const imgFile = vehicleImg[slot];
                            const previewUrl = imgFile ? URL.createObjectURL(imgFile) : null;
                            return(
                                <div className="h-35 flex flex-col p-2.5 gap-2.5 border-neutral-200 rounded-lg">
                                    <div className="w-full h-25">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt={`Slot ${slot}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-xs text-black/50 grid place-items-center bg-base-300 w-full h-full">Image {slot} Empty</div>
                                        )}
                                    </div>
                                    <div className="flex w-full justify-between">
                                        <label className="btn btn-primary btn-xs flex-1 mr-2.5 text-center cursor-pointer flex items-center justify-center">
                                            {imgFile ? "Change" : "Add Image"}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => imgInput(slot, e.target.files[0])} 
                                            />
                                        </label>
                                        <button className="btn btn-error btn-xs" type="button" onClick={()=>imgClear(slot)} disabled={!imgFile}>Delete Image</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <label htmlFor="plate" className="text-md font-semibold">Plate No.</label>
                    <input type="text" name="plate" id="plate" className="input input-primary w-full mb-2.5" onChange={inputChange} required/>

                    <label htmlFor="brand" className="text-md font-semibold">Brand</label>
                    <input type="text" name="brand" id="brand" className="input input-primary w-full mb-2.5" onChange={inputChange} required/>

                    <label htmlFor="year" className="text-md font-semibold">Year</label>
                    <input type="year" name="year" id="year" className="input input-primary w-full mb-2.5" onChange={inputChange} required/>
                    
                    <label htmlFor="rate" className="text-md font-semibold">Daily Rate</label>
                    <input type="number" name="rate" id="rate" min={0} className="input input-primary w-full mb-2.5" onChange={inputChange} required/>

                    <label htmlFor="owner" className="text-md font-semibold">Owner</label>
                    <input type="text" name="owner" id="owner" className="input input-primary w-full mb-2.5" onChange={inputChange} required/>

                    <label htmlFor="fuel" className="text-md font-semibold">Fuel Type</label>
                    <input type="text" name="fuel" id="fuel" className="input input-primary w-full mb-2.5" onChange={inputChange} required/>

                    <label htmlFor="trans" className="text-md font-semibold">Transmission</label>
                    <input type="trans" name="trans" id="trans" className="input input-primary w-full mb-2.5" onChange={inputChange} required/>

                    <label htmlFor="desc" className="text-md font-semibold">Description</label>
                    <textarea name="desc" id="desc" className="textarea textarea-primary w-full mb-2.5" onChange={inputChange} required></textarea>

                    <button type="submit" className="btn btn-primary">Add Vehicle</button>
                </form>
            </div>
        </div>
    )

}