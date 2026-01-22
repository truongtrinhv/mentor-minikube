import type { JSX } from "react";
import { Navigate, useLocation } from "react-router";

import { PATH } from "@/common/constants/paths";
import { useAuthContext } from "@/common/context/auth-context";
import type { Role } from "@/common/types/auth";

import { FullscreenLoading } from "../loading-spinner";

const PermissionRoute = ({
    children,
    role,
}: {
    children: JSX.Element;
    role: Role;
}) => {
    const { user, loading } = useAuthContext();
    const location = useLocation();
    if (loading) {
        return <FullscreenLoading />;
    }
    return user?.role == role ? (
        children
    ) : (
        <Navigate to={PATH.Forbidden} state={{ from: location }} replace />
    );
};

export default PermissionRoute;
