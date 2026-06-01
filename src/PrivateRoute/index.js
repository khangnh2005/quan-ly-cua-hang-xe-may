import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute(){
    const loginState = useSelector(state => state.loginReducer);
    const isLogin = typeof loginState === 'boolean' ? loginState : loginState?.isLogin;

    return(
        <>
            {isLogin ? (<Outlet />):(<Navigate to={"/"}/>)}
        </>
    )
}
export default PrivateRoute;
