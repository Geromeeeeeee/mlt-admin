import { Table } from "./table";
import { useRecords } from "./records";

export function Rentals (){
    const {records, returns ,buttonAction} = useRecords()
    const recordsArray = Object.values(records)
    const returnsArray = Object.values(returns)

    const pending =  recordsArray.filter(request => request.request_status === 'Pending' || (request.request_status === 'Approved' && request.payment_status === 'Unpaid' ||request.request_status ==='Approved' && request.payment_status === 'Proof Uploaded'))
    const approved =  recordsArray.filter(request => request.request_status === 'Approved' && request.payment_status=== 'Paid')
    const active = recordsArray.filter(status=>status.request_status==='Picked Up')
    const returnRequests = returnsArray.filter(status=>status.status === 'Pending' || status.status === 'Approved')

    return(
        <>
        <Table type={"Active Rental Requests"} list={active} action={buttonAction}/>
        <Table type={"Pending Rental Requests"} list={pending} action={buttonAction}/>
        <Table type={"Approved Rentals"} list={approved} action={buttonAction}/>
        <Table type={"Return Requests"} list={returnRequests} action={buttonAction}/>
        </>
    )
}