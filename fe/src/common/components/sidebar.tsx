import {
    BarChart3,
    Book,
    BookOpen,
    CalendarCheck,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Clock,
    Compass,
    Mail,
    Users,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "./ui/button";

import { cn } from "../lib/utils";
import { Role } from "../types/auth";

const adminMenuItems = [
    {
        name: "Dashboard",
        icon: <BarChart3 size={24} />,
        path: "/admin/dashboard",
    },
    {
        name: "Manage Users",
        icon: <Users size={24} />,
        path: "/admin/manage-users",
    },
    {
        name: "Manage Categories",
        icon: <Book size={24} />,
        path: "/admin/manage-course-categories",
    },
    {
        name: "Mentor Approvals",
        icon: <CheckSquare size={24} />,
        path: "/admin/mentor-approvals",
    },
    {
        name: "Messages",
        icon: <Mail size={24} />,
        path: "/admin/messages",
    },
];

const learnerMenuItems = [
    {
        name: "Dashboard",
        icon: <BarChart3 size={24} />,
        path: "/learner/dashboard",
    },
    {
        name: "Find Mentors",
        icon: <Compass size={24} />,
        path: "/learner/find-mentors",
    },
    {
        name: "Courses",
        icon: <BookOpen size={24} />,
        path: "/learner/courses",
    },
    {
        name: "Sessions",
        icon: <CalendarCheck size={24} />,
        path: "/learner/session-management",
    },
    {
        name: "Resources",
        icon: <BookOpen size={24} />,
        path: "/learner/resources",
    },
    {
        name: "Messages",
        icon: <Mail size={24} />,
        path: "/learner/messages",
    },
];

const mentorMenuItems = [
    {
        name: "Dashboard",
        icon: <BarChart3 size={24} />,
        path: "/mentor/dashboard",
    },
    {
        name: "Sessions",
        icon: <CalendarCheck size={24} />,
        path: "/mentor/session-management",
    },
    {
        name: "Availability",
        icon: <Clock size={24} />,
        path: "/mentor/availability",
    },
    {
        name: "Courses",
        icon: <Book size={24} />,
        path: "/mentor/my-courses",
    },
    {
        name: "Resources",
        icon: <BookOpen size={24} />,
        path: "/mentor/my-resources",
    },
    {
        name: "Messages",
        icon: <Mail size={24} />,
        path: "/mentor/messages",
    },
];

type SidebarProps = {
    isSidebarOpen: boolean;
    onToggle: (isOpen: boolean) => void;
    userRole?: Role;
};

const Sidebar = ({
    isSidebarOpen,
    onToggle,
    userRole = Role.Admin,
}: SidebarProps) => {
    const location = useLocation();

    const toggleSidebar = () => {
        const newState = !isSidebarOpen;
        onToggle(newState);
    };

    useEffect(() => {
        const handleResize = () => onToggle(false);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [onToggle]);

    const menuItems =
        userRole === Role.Admin
            ? adminMenuItems
            : userRole === Role.Mentor
              ? mentorMenuItems
              : learnerMenuItems;

    return (
        <>
            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 md:hidden"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(false);
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-background fixed top-16 bottom-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 transition-[width] duration-300 ease-in-out dark:border-gray-800",
                    isSidebarOpen ? "w-64" : "w-18",
                )}
            >
                <Button
                    onClick={toggleSidebar}
                    variant="outline"
                    className="border-border bg-background hover:bg-accent absolute top-6 -right-3 z-40 flex h-6 w-6 items-center justify-center rounded-full border p-0 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                    aria-label={
                        isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                    }
                >
                    {isSidebarOpen ? (
                        <ChevronLeft className="text-foreground h-3.5 w-3.5 dark:text-gray-300" />
                    ) : (
                        <ChevronRight className="text-foreground h-3.5 w-3.5 dark:text-gray-300" />
                    )}
                </Button>

                <nav className="flex h-full flex-col overflow-hidden p-3">
                    <ul className={cn("space-y-2")}>
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "group relative flex items-center rounded-md px-3 py-3 transition-colors",
                                        location.pathname === item.path
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                                        !isSidebarOpen && "w-fit",
                                    )}
                                >
                                    <span className="flex-shrink-0">
                                        {item.icon}
                                    </span>
                                    {isSidebarOpen && (
                                        <span className="ml-3 font-medium whitespace-nowrap">
                                            {item.name}
                                        </span>
                                    )}
                                    {!isSidebarOpen && (
                                        <span className="absolute left-full ml-6 rounded bg-gray-900 px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
                                            {item.name}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
