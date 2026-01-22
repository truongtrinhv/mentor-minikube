import { useAuthContext } from "@/common/context/auth-context";

import { AvailabilityPage } from "./components/AvailabilityPage";

const MentorAvailabilityPage = () => {
    const { user } = useAuthContext();

    if (!user?.id) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex min-h-[400px] items-center justify-center">
                    <span className="text-muted-foreground">
                        Please login to access this page.
                    </span>
                </div>
            </div>
        );
    }

    return <AvailabilityPage />;
};

export default MentorAvailabilityPage;
