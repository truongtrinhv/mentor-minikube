import React from "react";
import { Navigate } from "react-router-dom";

import { PATH } from "@/common/constants/paths";

import { useAuthContext } from "../../context/auth-context";
import { Role } from "../../types/auth";

type AuthRedirectRouteProps = {
    children: React.ReactNode;
    redirectAuthenticated?: boolean;
    redirectPath?: string;
};

const AuthRedirectRoute: React.FC<AuthRedirectRouteProps> = ({
    children,
    redirectAuthenticated = true,
    redirectPath,
}) => {
    const { isAuthenticated, user } = useAuthContext();

    if (redirectAuthenticated && isAuthenticated) {
        if (redirectPath) {
            return <Navigate to={redirectPath} replace />;
        }

        if (user?.role === Role.Admin) {
            return <Navigate to={PATH.AdminDashboard} replace />;
        } else if (user?.role === Role.Mentor) {
            return <Navigate to={PATH.MentorDashboard} replace />;
        } else if (user?.role === Role.Learner) {
            return <Navigate to={PATH.LearnerDashboard} replace />;
        }
    }

    if (!redirectAuthenticated && !isAuthenticated) {
        return <Navigate to={PATH.Login} replace />;
    }

    return <>{children}</>;
};

export default AuthRedirectRoute;
