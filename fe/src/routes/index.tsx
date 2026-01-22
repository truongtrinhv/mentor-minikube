import { Navigate, createBrowserRouter } from "react-router-dom";

import AuthRedirectRoute from "@/common/components/routes/AuthRedirectRoute";
import MentorApplicationRoute from "@/common/components/routes/MentorApplicationRoute";
import PermissionRoute from "@/common/components/routes/PermissionRoute";
import { Role } from "@/common/types/auth";
import MentorLayout from "@/layouts/mentor-layout";
import ManageCourseCategoryPage from "@/modules/AdminPage/ManageCourseCategoryPage";
import ManageUsersPage from "@/modules/AdminPage/ManageUsersPage";
import MentorApprovalsPage from "@/modules/AdminPage/MentorApprovalsPage";
import HomePage from "@/modules/HomePage";
import { DashboardPage } from "@/modules/LearnerPages/DashboardPage";
import FindMentorsPage from "@/modules/LearnerPages/FindMentorsPage";
import LearnerSessionManagementPage from "@/modules/LearnerPages/SessionManagementPage";
import { SessionsBookingPage } from "@/modules/LearnerPages/SessionsBookingPage";
import Login from "@/modules/LoginPage";
import ApplicationStatusPage from "@/modules/MentorPages/ApplicationStatusPage";
import MentorAvailabilityPage from "@/modules/MentorPages/AvaibilityPage";
import MentorDashboardPage from "@/modules/MentorPages/MentorDashboardPage";
import SessionManagementPage from "@/modules/MentorPages/SessionManagementPage";
import MessagePage from "@/modules/MessagePage";
import OTPVerificationPage from "@/modules/OTPVerificationPage";

import MainLayout from "../layouts/main-layout";
import { AdminDashboardPage } from "../modules/AdminPage/AdminDashboardPage";
import { LearnerCourseDetailsPage } from "../modules/LearnerPages/LearnerCourseDetailsPage";
import { LearnerCoursesPage } from "../modules/LearnerPages/LearnerCoursesPage";
import { LearnerResourcesPage } from "../modules/LearnerPages/LearnerResourcesPage";
import { MentorCourseAddPage } from "../modules/MentorPages/MentorCourseAddPage";
import { MentorCourseDetailsPage } from "../modules/MentorPages/MentorCourseDetailsPage";
import { MentorCourseEditPage } from "../modules/MentorPages/MentorCourseEditPage";
import { MentorCoursesPage } from "../modules/MentorPages/MentorCoursesPage";
import { MentorResourcesPage } from "../modules/MentorPages/MentorResourcesPage";
import ForgotPassword from "../modules/PasswordResetPage";
import ProfilePage from "../modules/ProfilePage";
import Register from "../modules/RegisterPage";

const router = createBrowserRouter([
    {
        path: "/login",
        element: (
            <AuthRedirectRoute>
                <Login />
            </AuthRedirectRoute>
        ),
    },
    {
        path: "/register",
        element: (
            <AuthRedirectRoute>
                <Register />
            </AuthRedirectRoute>
        ),
    },
    {
        path: "/forgot-password",
        element: (
            <AuthRedirectRoute>
                <ForgotPassword />
            </AuthRedirectRoute>
        ),
    },
    {
        path: "/verify-otp",
        element: (
            <AuthRedirectRoute>
                <OTPVerificationPage />
            </AuthRedirectRoute>
        ),
    },
    {
        path: "/",
        element: (
            <AuthRedirectRoute>
                <HomePage />
            </AuthRedirectRoute>
        ),
    },
    {
        path: "/forbidden",
        element: (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="mb-4 text-4xl font-bold text-red-600">
                        403
                    </h1>
                    <p className="mb-4 text-xl text-gray-600">Forbidden</p>
                    <p className="text-gray-500">
                        You don't have permission to access this resource.
                    </p>
                </div>
            </div>
        ),
    },
    {
        path: "/admin",
        element: (
            <PermissionRoute role={Role.Admin}>
                <MainLayout />
            </PermissionRoute>
        ),
        children: [
            {
                path: "dashboard",
                element: <AdminDashboardPage />,
            },
            {
                path: "manage-users",
                element: <ManageUsersPage />,
            },
            {
                path: "manage-course-categories",
                element: <ManageCourseCategoryPage />,
            },
            {
                path: "mentor-approvals",
                element: <MentorApprovalsPage />,
            },
            {
                path: "messages",
                element: <MessagePage />,
            },
        ],
    },
    {
        path: "/mentor",
        element: (
            <PermissionRoute role={Role.Mentor}>
                <MentorApplicationRoute>
                    <MainLayout />
                </MentorApplicationRoute>
            </PermissionRoute>
        ),
        children: [
            {
                path: "dashboard",
                element: <MentorDashboardPage />,
            },
            {
                path: "availability",
                element: <MentorAvailabilityPage />,
            },
            {
                path: "messages",
                element: <MessagePage />,
            },
            {
                path: "profile",
                element: <ProfilePage />,
            },
            {
                path: "my-courses",
                element: <MentorCoursesPage />,
            },
            {
                path: "my-courses/:id",
                element: <MentorCourseDetailsPage />,
            },
            {
                path: "my-courses/:id/edit",
                element: <MentorCourseEditPage />,
            },
            {
                path: "my-courses/add",
                element: <MentorCourseAddPage />,
            },
            {
                path: "my-resources",
                element: <MentorResourcesPage />,
            },
            {
                path: "session-management",
                element: <SessionManagementPage />,
            },
        ],
    },
    {
        path: "/mentor",
        element: (
            <PermissionRoute role={Role.Mentor}>
                <MentorApplicationRoute>
                    <MentorLayout />
                </MentorApplicationRoute>
            </PermissionRoute>
        ),
        children: [
            {
                path: "applications/status",
                element: <ApplicationStatusPage />,
            },
        ],
    },
    {
        path: "/learner",
        element: (
            <PermissionRoute role={Role.Learner}>
                <MainLayout />
            </PermissionRoute>
        ),
        children: [
            {
                path: "dashboard",
                element: <DashboardPage />,
            },
            {
                path: "find-mentors",
                element: <FindMentorsPage />,
            },
            {
                path: "sessions",
                element: <SessionsBookingPage />,
            },
            {
                path: "resources",
                element: <LearnerResourcesPage />,
            },
            {
                path: "messages",
                element: <MessagePage />,
            },
            {
                path: "profile",
                element: <ProfilePage />,
            },
            {
                path: "courses",
                element: <LearnerCoursesPage />,
            },
            {
                path: "courses/:id",
                element: <LearnerCourseDetailsPage />,
            },
            {
                path: "session-management",
                element: <LearnerSessionManagementPage />,
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);

export default router;
