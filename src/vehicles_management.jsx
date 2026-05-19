import { Vehicle_Table } from "./vehicle_table";
import { useRecords } from "./records";

export function Vehicle_Management_Page (){
    const {vehicles} = useRecords()
    const vehicleDetails = Object.values(vehicles)
    return(
        <>
        <Vehicle_Table details={vehicleDetails}/>
        </>
    )
}