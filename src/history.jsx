import { useRecords } from "./records";
import { Table } from "./table";
import { useState } from "react";

export function History(){
    const {records} = useRecords()
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("All")

    const cancelled = records.filter(history => history.request_status === 'Cancelled')
    const completed = records.filter(history => history.request_status === 'Returned')

    const searchLower = search.toLowerCase()

    const filtered = records
        .filter(history => {
            if (filter === "Cancelled") return history.request_status === "Cancelled"
            if (filter === "Completed") return history.request_status === "Returned"
            return history.request_status === "Cancelled" || history.request_status === "Returned"
        })
        .filter(history =>
            history.fullname?.toLowerCase().includes(searchLower) ||
            history.model?.toLowerCase().includes(searchLower)
        )


    return(
        <>
        <div className="flex w-full max-w-full p-2.5 box-border gap-2.5 sticky top-0 z-25 bg-white/75 backdrop-blur-sm">
              <input
                 type="search"
                 placeholder="Search"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="input input-neutral"
              />
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select select-neutral">
                <option value="All">All</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
            </select>
        </div>
        <Table
            type={filter}
            list={filtered}
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
        />
        </>
    )
}