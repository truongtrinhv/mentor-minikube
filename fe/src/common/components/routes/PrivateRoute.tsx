import type { JSX } from "react";
import { Navigate, useLocation } from "react-router";

import { useAuthContext } from "@/common/context/auth-context";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuthContext();
    const location = useLocation();
    return isAuthenticated ? (
        children
    ) : (
        <Navigate to={"/"} state={{ from: location }} replace />
    );
};

export default PrivateRoute;
