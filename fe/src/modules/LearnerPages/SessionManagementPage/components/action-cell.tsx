import { Eye } from "lucide-react";
import { useState } from "react";

import { Button } from "@/common/components/ui/button";
import { SessionStatus } from "@/common/types/enums";

import ConfirmRescheduleForm from "./confirm-reschedule-form";

import { useApproveSession } from "../hooks/useApproveSession";
import type { LearnerSessionResponse } from "../types/learner-session-response";

export const ActionCell = ({
    session,
}: {
    session: LearnerSessionResponse;
}) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const { approve, reject, isPending } = useApproveSession(session.id);

    const handleApprove = async () => {
        console.log("Approved session: ", session);
        await approve();
        setIsConfirmOpen(false);
    };
    const handleReject = async () => {
        console.log("Rejected session: ", session);
        await reject();
        setIsConfirmOpen(false);
    };

    return (
        session.sessionStatus == SessionStatus.Rescheduling && (
            <>
                <div className="flex justify-center space-x-2">
                    <Button
                        onClick={() => setIsConfirmOpen(true)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 py-0"
                    >
                        <Eye size={14} className="text-blue-500" />
                    </Button>
                </div>
                <ConfirmRescheduleForm
                    loading={isPending}
                    onOpenChange={setIsConfirmOpen}
                    open={isConfirmOpen}
                    currentSessionInfo={session}
                    handleApprove={handleApprove}
                    handleReject={handleReject}
                />
            </>
        )
    );
};
