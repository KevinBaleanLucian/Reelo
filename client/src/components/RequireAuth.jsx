import { Navigate,Outlet,useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth.js";

function RequireAuth() {
    const {status,signedOut} = useAuth();
    const location=useLocation();

    if(status==='loading'){
        return (
            <p className="visually-hidden" role="status">
                Loading...
            </p>
        );
    }

    if(status==='anonymous'){
        if(signedOut) return <Navigate to="/" replace />;
        return <Navigate to="/login" replace state={{from: location}} />
    }

    return <Outlet />;
}

export default RequireAuth;