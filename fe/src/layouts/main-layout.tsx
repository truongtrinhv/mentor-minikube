import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "@/common/components/header";
import Sidebar from "@/common/components/sidebar";
import { useAuthContext } from "@/common/context/auth-context";

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user } = useAuthContext();

    const handleSidebarToggle = (isOpen: boolean) => {
        setIsSidebarOpen(isOpen);
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                onToggle={handleSidebarToggle}
                userRole={user?.role}
            />
            <main
                className={`flex-grow pt-16 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? "pl-64" : "pl-20"
                }`}
            >
                <div className="container mx-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
