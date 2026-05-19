import { Vehicle_Table } from "./vehicle_table";
import { useRecords } from "./records";

export function Vehicle_Management_Page (){
    const {vehicles, getVehicles, updateVehicles} = useRecords()
    const vehicleDetails = Object.values(vehicles)
    return(
        <>
        <Vehicle_Table details={vehicleDetails} getVehicles={getVehicles} updateVehicles={updateVehicles}/>
        </>
    )
}