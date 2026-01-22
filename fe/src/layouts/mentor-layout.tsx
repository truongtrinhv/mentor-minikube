import { Outlet } from "react-router-dom";

import Header from "@/common/components/header";

const MentorLayout = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow pt-16">
                <div className="container mx-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MentorLayout;
