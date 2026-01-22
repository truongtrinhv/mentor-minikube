import { BookOpen, Crown, GraduationCap, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/common/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";

import { NotificationDropdown } from "./notifications/notification-dropdown";
import { ThemeSwitcher } from "./theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { useAuthContext } from "../context/auth-context";
import { Role } from "../types/auth";

const Header = () => {
    const { logout, user } = useAuthContext();

    const getInitials = () => {
        if (!user || !user.fullName) return "UN";

        const nameParts = user.fullName.split(" ");
        if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

        return (
            nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
        ).toUpperCase();
    };

    const isAdmin = user?.role === Role.Admin;

    const getProfilePath = () => {
        if (user?.role === Role.Mentor) {
            return "/mentor/profile";
        }
        return "/learner/profile";
    };

    const getRoleInfo = () => {
        switch (user?.role) {
            case Role.Admin:
                return {
                    label: "Admin",
                    icon: Crown,
                    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
                };
            case Role.Mentor:
                return {
                    label: "Mentor",
                    icon: GraduationCap,
                    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                };
            case Role.Learner:
                return {
                    label: "Learner",
                    icon: BookOpen,
                    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                };
            default:
                return {
                    label: "User",
                    icon: User,
                    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                };
        }
    };

    const roleInfo = getRoleInfo();
    const RoleIcon = roleInfo.icon;

    return (
        <header className="fixed top-0 left-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-black">
            <div className="flex items-center gap-2 md:gap-4">
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-primary text-xl font-bold">
                        Mentor Platform
                    </span>
                    {user && (
                        <Badge
                            variant="secondary"
                            className={`ml-2 text-xs font-medium ${roleInfo.color}`}
                        >
                            <RoleIcon className="mr-1 h-3 w-3" />
                            {roleInfo.label}
                        </Badge>
                    )}
                </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <NotificationDropdown />
                <ThemeSwitcher />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="hover:ring-primary/20 h-9 w-9 cursor-pointer transition hover:ring-2">
                            <AvatarImage
                                src={user?.avatarUrl}
                                alt={user?.fullName || "User"}
                            />
                            <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-1.5">
                            <p className="text-sm font-medium">
                                {user && user.fullName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {user && user.email}
                            </p>
                            <div className="mt-2">
                                <Badge
                                    variant="secondary"
                                    className={`text-xs font-medium ${roleInfo.color}`}
                                >
                                    <RoleIcon className="mr-1 h-3 w-3" />
                                    {roleInfo.label}
                                </Badge>
                            </div>
                        </div>
                        <DropdownMenuSeparator />

                        {!isAdmin && (
                            <DropdownMenuItem asChild>
                                <Link
                                    to={getProfilePath()}
                                    className="flex w-full cursor-pointer"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                            onClick={logout}
                            className="text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-950/20 dark:focus:text-red-500"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Header;
