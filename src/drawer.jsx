import { Link, Outlet, useNavigate } from "react-router-dom"
import axios from "axios"
import { API_BASE_URL } from "./config"
import {useState} from 'react'

export function Drawer ({logged, setLogged}) {

    const nav = useNavigate()
    const [logoutModal, setLogOutModal] = useState(false)

    const logOut = async (e) => {
        try {
            await axios.post(`${API_BASE_URL}/back/login.php`,{
                action: 'logout'
            })
            localStorage.removeItem('loggedIn')
            setLogged(false)
            nav("/")
        } catch (error) {
            
        }
    }

    return(
        <>
        {logoutModal && (
            <div className="w-full h-screen flex justify-center items-center z-50 fixed inset-0">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                <div className="z-10 flex flex-col justify-evenly items-center w-[30%] h-[40%] bg-gray-100 rounded-3xl">
                    <div className="text-center">
                        <h1 className="text-[4vh] font-semibold">Log out?</h1>
                        <p>You are about to log out</p>
                    </div>
                    <div className="flex w-[75%] h-[25%] items-center justify-evenly">
                        <button className="btn btn-primary p-5 px-10" onClick={()=>{
                            setLogOutModal(false)
                        }}>No</button>
                        <button className="btn btn-error p-5 px-10" onClick={logOut}>Yes</button>
                    </div>
                </div>
            </div>
        )}
        <div className="drawer drawer-open">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

            <main className="drawer-content bg-base-100">
                <Outlet/>
            </main>

            <aside className="drawer-side p-2.5">
                <ul className="min-h-full flex flex-col w-[17.5vw] px-10 py-7.5 shadow-[0px_0px_6px_0px_rgba(0,0,0,0.25)] rounded-lg box-border">
                    <li className="mb-7.5 text-3xl font-bold text-blue-500">MLT Admin</li>
                    <li className="mb-2.5">
                        <Link to="/Manage Vehicles" className="link-hover text-xl">
                        ● Vehicles
                        </Link>
                    </li>
                    <li className="mb-2.5">
                        <Link to="/Rentals" className="link-hover text-lg">
                        ● Rentals
                        </Link>
                    </li>
                    <li className="mb-2.5">
                        <Link to="/History" className="link-hover text-lg">
                        ● History
                        </Link>
                    </li>
                    <li className="mb-2.5">
                        <Link to="/Users" className="link-hover text-lg">
                        ● User Accounts
                        </Link>
                    </li>
                    <li className="mt-auto link-hover link-error text-lg" onClick={()=>setLogOutModal(true)}>  
                        ● Logout
                    </li>
                </ul>
            </aside>
        </div>
        </>
    )
}