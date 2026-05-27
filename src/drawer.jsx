import { Link } from "react-router-dom"

export function Drawer ({children}) {
    return(
        <>
        <div className="drawer drawer-open">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

            <main className="drawer-content bg-base-100">
                {children}
            </main>

            <aside className="drawer-side p-2.5">
                <ul className="min-h-full w-[17.5vw] px-10 py-7.5 shadow-[0px_0px_6px_0px_rgba(0,0,0,0.25)] rounded-lg box-border">
                    <li className="mb-7.5 text-3xl font-bold text-blue-500">MLT Admin</li>
                    <li className="mb-2.5">
                        <Link to="/Manage Vehicles" className="link-hover text-xl">
                        Vehicles
                        </Link>
                    </li>
                    <li className="mb-2.5">
                        <Link to="/" className="link-hover text-xl">
                        Rentals
                        </Link>
                    </li>
                    <li className="mb-2.5">
                        <Link to="/History" className="link-hover text-xl">
                        History
                        </Link>
                    </li>
                    <li className="mb-2.5">
                        <Link to="/Users" className="link-hover text-xl">
                        User Accounts
                        </Link>
                    </li>
                </ul>
            </aside>
        </div>
        </>
    )
}