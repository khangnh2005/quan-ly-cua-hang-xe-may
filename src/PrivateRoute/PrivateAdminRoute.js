import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function PrivateAdminRoute() {
    const adminState = useSelector(state => state.adminReducer);
    const isAdmin = typeof adminState === 'boolean' ? adminState : adminState?.isAdmin;

    return(
        <>
            {isAdmin ? (<Outlet />) : (<Navigate to={"/admin"} />)}
        </>
    )
}
export default PrivateAdminRoute;