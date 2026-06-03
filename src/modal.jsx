import {useNavigate} from "react-router-dom";

export function PopUp({data, setData, action, result}){
    const nav = useNavigate()
    if(!data) return null
    const { msg, type, id, action: actionType} = data;

    const handleClose = () => {
        setData(null)
        if (!actionType) {
            nav("/Rentals")
        }
    }

    return(
        <div className="modal modal-open bg-black/40 fixed inset-0 z-50" onClick={handleClose}>
            <div className="modal-box modal-middle z-20 w-fit h-fit min-w-[25vw] min-h-[25vh] p-0 flex flex-col" onClick={(e)=>e.stopPropagation()}>
            <div className={`w-full h-fit min-h-[5vh] p-2.5 flex justify-start ${type==='green' ? 'bg-green-500' : 'bg-red-500'}`}>
            <h1 className="font-semibold text-white text-xl">{actionType}</h1>
            <button className="ml-auto text-2xl text-white hover:text-black/50" 
            onClick={handleClose}>×</button>
            </div>
            <div className="flex flex-1 text-black/80 p-5 justify-center items-center text-center text-lg">
                {msg}
            </div>
            {actionType && (
            <div className="w-full h-fit p-2.5 flex justify-around">
            <button className={`btn ${type ==='green' ? 'btn-error' : 'btn-primary'}`} onClick={handleClose}>No</button>
            <button className={`btn ${type ==='green' ? 'btn-primary' : 'btn-error'}`}
            onClick={()=> {
                action(id, actionType, (message)=>{
                    result({
                        msg: message,
                        type: type,
                        actionType: null
                    })
                })
            }}>Yes</button>
            </div>
            )}
            </div>
        </div>
    )
}