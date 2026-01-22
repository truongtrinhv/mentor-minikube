import { format } from "date-fns";
import { BookmarkCheck, CalendarSync, Check } from "lucide-react";
import { Fragment, useState } from "react";

import { ConfirmDialog } from "@/common/components/dialog/confirm-dialog";
import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/lib/utils";
import { SessionStatus } from "@/common/types/enums";

import RescheduleForm from "./reschedule-form";

import { useApproveSession } from "../hooks/useApproveSession";
import { useCompleteSession } from "../hooks/useCompleteSession";
import { useRescheduleSession } from "../hooks/useRescheduleSession";
import { type MentoringSessionResponse } from "../types/mentoring-session-response";
import type { RescheduleSessionRequest } from "../types/update-session-request";

export const ActionCell = ({
    session,
}: {
    session: MentoringSessionResponse;
}) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [action, setAction] = useState<"Approve" | "Complete" | "None">(
        "None",
    );
    const { approve, isPending: isApprovePending } = useApproveSession(
        session.id,
    );
    const { complete, isPending: isCompletePending } = useCompleteSession(
        session.id,
    );
    const { reschedule } = useRescheduleSession(session.id);
    const [openRescheduleForm, setOpenRescheduleForm] =
        useState<boolean>(false);

    const handleAction = (action: "Approve" | "Complete") => {
        setAction(action);
        setIsConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (action == "Approve") {
            await approve();
        }
        if (action == "Complete") {
            await complete();
        }
        setIsConfirmOpen(false);
    };

    const handleSubmitRescheduleInfo = async (
        data: RescheduleSessionRequest,
    ) => {
        console.log("Reschedule data: ", data);
        await reschedule(data);
        setOpenRescheduleForm(false);
    };

    return (
        <Fragment>
            {session.sessionStatus == SessionStatus.Pending && (
                <div className="flex justify-center space-x-2">
                    <Button
                        onClick={() => setOpenRescheduleForm(true)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 py-0"
                    >
                        <CalendarSync size={14} className="text-blue-500" />
                    </Button>
                    <Button
                        onClick={() => handleAction("Approve")}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 py-0"
                    >
                        <Check size={14} className="text-green-500" />
                    </Button>
                </div>
            )}
            {session.sessionStatus == SessionStatus.Scheduled && (
                <div className="flex justify-center space-x-2">
                    <Button
                        onClick={() => handleAction("Complete")}
                        variant="outline"
                        size="sm"
                        className="text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <BookmarkCheck
                            size={14}
                            className="mr-1 text-blue-500"
                        />
                        Complete
                    </Button>
                </div>
            )}
            <RescheduleForm
                open={openRescheduleForm}
                onOpenChange={setOpenRescheduleForm}
                onSubmit={handleSubmitRescheduleInfo}
                currentSessionInfo={session}
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                handleConfirm={handleConfirm}
                className="max-w-md"
                title={`${action} this session?`}
                desc={
                    <>
                        You are about to <strong>{action.toLowerCase()}</strong>{" "}
                        the session{" "}
                        <strong>
                            from {format(session.startTime, "PPPppp")} to{" "}
                            {format(session.endTime, "PPPppp")}
                        </strong>{" "}
                        with <strong>{session.learnerName}</strong> for course{" "}
                        <strong>{session.courseName}</strong>. <br />
                        This action cannot be undone.
                    </>
                }
                isLoading={isApprovePending || isCompletePending}
                confirmText={action}
                classNameConfirmButton={cn(
                    action === "Approve" &&
                        "bg-green-500 hover:bg-green-600 text-white",
                    action === "Complete" &&
                        "bg-blue-500 hover:bg-blue-600 text-white",
                )}
            />
        </Fragment>
    );
};
