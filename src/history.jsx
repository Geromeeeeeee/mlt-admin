import { useRecords } from "./records";
import { Table } from "./table";

export function History(){
    const {records} = useRecords()

    const cancelled = records.filter(history => history.request_status === 'Cancelled')
    const completed = records.filter(history => history.request_status === 'Returned')

    return(
        <>
        <Table type={"Cancelled"} list={cancelled}/>
        <Table type={"Completed"} list={completed}/>
        </>
    )
}