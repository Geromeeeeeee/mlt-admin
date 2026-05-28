import { useState, useEffect } from "react"
import {API_BASE_URL} from "./config"

export function User_Tables ({type, users, handleUsers}){

    const [search, setSearch] = useState("")
    const [licenseModal, setLicenseModal] = useState(false)
    const [licenseImg, setLicenseImg] = useState(null)

    //para mag run yung get users kahit walang request na sinesend si user, technically
    useEffect(()=>{
        handleUsers("getUsers")
    },[])

    return(
        <>
        <div className="p-5">
        {licenseModal && (
            <div className="modal modal-open bg-black/60 z-30" onClick={() => { setLicenseModal(false); setLicenseImg(null); }}>
                <div className="w-[75vw] h-fit bg-white p-2.5 rounded-lg flex flex-col items-center justify-start relative [&::-webkit-scrollbar]:hidden" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-sm btn-circle btn-error mb-2.5 ml-auto text-white" onClick={() => { setLicenseModal(false); setLicenseImg(null); }}>
                        ✕
                    </button>
                    {licenseImg ? (
                        <img src={licenseImg} alt="License" className="max-h-[80vh] w-auto object-contain" />
                    ) : (
                        <p className="text-sm text-neutral-500">No license image available.</p>
                    )}
                </div>
            </div>
        )}
        <h1 className="text-xl font-bold mb-2.5">{type} Users</h1>
        <div className="w-full h-fit flex justify-start mb-2.5">
        <input type="search" name="" id="" placeholder="Search: eg, ABC 123, John Smith, Toyota" className="input input-neutral" onChange={(e)=>setSearch(e.target.value)}/>
        </div>

        <table className="table table-zebra table-pin-rows bg-base-100 shadow-sm">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Address</th>
                    <th>License No.</th>
                    <th>License Pic</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {users.length === 0 ? (
                    <>
                    <tr>
                        <td colSpan={7}>No Users To Show</td>
                    </tr>
                    </>
                ) : (
                users?.filter((user)=>
                    user.fullname.toLowerCase().includes(search.toLowerCase()) || 
                    user.email.toLowerCase().includes(search.toLowerCase()) ||
                    user.phone.toLowerCase().includes(search.toLowerCase()) ||
                    user.address.toLowerCase().includes(search.toLowerCase())).
                    map((user, index)=>{
                    return(
                        <tr key={index}>
                            <td>{user.fullname}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.address}</td>
                            <td>{user.license}</td>
                            <td>
                                <button
                                    className="btn btn-info text-white btn-sm"
                                    onClick={() => {
                                        setLicenseImg(user.license_picture
                                            ? `${API_BASE_URL}/back/Uploads/License/${user.license_picture}`
                                            : null);
                                        setLicenseModal(true);
                                    }}
                                >
                                    License
                                </button>
                            </td>
                            <td>
                                <button className={`btn btn-sm ${user.is_archived == 1 ? "btn-primary" : "btn-error"}`}
                                onClick={() => user.is_archived == 0 ? handleUsers("archiveUser", user.user_id) : handleUsers("unarchiveUser", user.user_id)}>
                                    {user.is_archived == 1 ? "Unarchive" : "Archive"}
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