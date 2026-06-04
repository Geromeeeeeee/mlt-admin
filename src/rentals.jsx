import { Table } from "./table";
import { useRecords } from "./records";

export function Rentals (){
    const {records, returns, extensions, buttonAction} = useRecords()
    const recordsArray = Object.values(records)
    const returnsArray = Object.values(returns)
    const extensionsArray = Object.values(extensions)

    const pendingStatuses = [
        'Unpaid', 
        'Downpayment Proof Uploaded', 
        'Downpayment Reupload Required', 
        'Downpayment Verified',
        'Final Proof Uploaded', 
        'Final Reupload Required'
    ]

    const extension = extensionsArray.filter(ext =>
        ext.status === 'Pending' ||
        ext.payment_status !== 'Fully Paid'
    )

    const pending = recordsArray.filter(request => 
        request.request_status === 'Pending' || 
        (request.request_status === 'Approved' && pendingStatuses.includes(request.payment_status))
    )

    const approved = recordsArray.filter(request => 
        request.request_status === 'Approved' && 
        request.payment_status === 'Fully Paid'
    )

    const active = recordsArray.filter(status=>status.request_status==='Picked Up')

    const returnRequests = returnsArray.filter(
        status=>status.status === 'Pending' || 
        status.status === 'Approved')

    return(
        <>
        <Table type={"Active Rental Requests"} list={active} action={buttonAction}/>
        <Table type={"Pending Rental Requests"} list={pending} action={buttonAction}/>
        <Table type={"Extension Requests"} list={extension} action={buttonAction}/>
        <Table type={"Approved Rentals"} list={approved} action={buttonAction}/>
        <Table type={"Return Requests"} list={returnRequests} action={buttonAction}/>
        </>
    )
}