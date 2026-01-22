import { MentorApprovalsForm } from "./components/mentor-approvals-form";

export default function MentorApprovalsPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Mentor Approvals Management
                    </h1>
                    <p className="text-gray-500">
                        Manage mentor approvals on the platform
                    </p>
                </div>
            </div>
            <MentorApprovalsForm />
        </div>
    );
}
