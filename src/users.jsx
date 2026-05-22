import { User_Tables } from "./user_tables";
import { useRecords } from "./records";

export function Users (){
    const {manageUsers, users} = useRecords()
    const userData = Object.values(users)

    const active = userData.filter(users=>users.is_archived == 0)
    const archived = userData.filter(users=>users.is_archived == 1)
    return(
        <>
        <User_Tables type={"Active"} users={active} handleUsers = {manageUsers}/>
        <User_Tables type={"Archived"} users={archived} handleUsers = {manageUsers}/>
        </>
    )
}