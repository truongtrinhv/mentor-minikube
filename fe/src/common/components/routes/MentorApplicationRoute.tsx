import type { JSX } from "react";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

import { PATH } from "@/common/constants/paths";
import { ApplicationStatus } from "@/modules/AdminPage/MentorApprovalsPage/types";
import { applicationStatusService } from "@/modules/MentorPages/ApplicationStatusPage/services/applicationStatusService";
import type { CurrentUserApplication } from "@/modules/MentorPages/ApplicationStatusPage/types";

import { FullscreenLoading } from "../loading-spinner";

const ALLOWED_PENDING_PATHS = ["/mentor/applications/status"];

const MentorApplicationRoute = ({ children }: { children: JSX.Element }) => {
    const [application, setApplication] =
        useState<CurrentUserApplication | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response =
                    await applicationStatusService.getCurrentUserApplication();
                setTimeout(() => {
                    setApplication(response.data || null);
                    setIsLoading(false);
                }, 500);
            } catch (error) {
                console.error("Error fetching application:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <FullscreenLoading />;
    }

    if (!application) {
        const currentPath = location.pathname;
        const isAllowedPath = ALLOWED_PENDING_PATHS.some((path) =>
            currentPath.includes(path),
        );

        if (isAllowedPath) {
            return children;
        } else {
            return <Navigate to={PATH.MentorApplication} replace />;
        }
    }

    if (application.status === ApplicationStatus.Approved) {
        return children;
    }

    if (
        application.status === ApplicationStatus.Pending ||
        application.status === ApplicationStatus.UnderReview ||
        application.status === ApplicationStatus.Rejected
    ) {
        const currentPath = location.pathname;
        const isAllowedPath = ALLOWED_PENDING_PATHS.some((path) =>
            currentPath.includes(path),
        );

        if (isAllowedPath) {
            return children;
        } else {
            return <Navigate to={PATH.MentorApplication} replace />;
        }
    }

    return children;
};

export default MentorApplicationRoute;
