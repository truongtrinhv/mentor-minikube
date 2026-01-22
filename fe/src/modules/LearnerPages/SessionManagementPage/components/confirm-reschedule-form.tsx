"use client";

import { format } from "date-fns";
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    User,
    XCircle,
} from "lucide-react";

import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/common/components/ui/dialog";
import { Label } from "@/common/components/ui/label";
import { Separator } from "@/common/components/ui/separator";

import type { LearnerSessionResponse } from "../types/learner-session-response";

type ConfirmRescheduleFormProps = {
    open: boolean;
    loading: boolean;
    onOpenChange: (open: boolean) => void;
    currentSessionInfo: LearnerSessionResponse;
    handleApprove?: () => void;
    handleReject?: () => void;
};

export default function ConfirmRescheduleForm(
    props: ConfirmRescheduleFormProps,
) {
    const {
        open,
        onOpenChange,
        currentSessionInfo,
        handleApprove = () => {},
        handleReject = () => {},
        loading = false,
    } = props;

    console.log(currentSessionInfo);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                Reschedule Request
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm">
                                Review and approve or reject this reschedule
                                request
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Mentor Information */}
                    <div className="bg-card flex items-center gap-3 rounded-lg border p-4">
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                            <User className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">
                                Mentor
                            </p>
                            <p className="font-semibold">
                                {currentSessionInfo.mentorName}
                            </p>
                        </div>
                    </div>

                    {/* Schedule Comparison */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold">Schedule Changes</h4>
                            <Badge variant="secondary" className="text-xs">
                                Pending Approval
                            </Badge>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Current Schedule */}
                            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50/50 p-4">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <h5 className="font-medium text-red-700">
                                        Current Schedule
                                    </h5>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-red-500" />
                                        <p>
                                            <span className="font-medium">
                                                From:{" "}
                                            </span>
                                            <span>
                                                {format(
                                                    currentSessionInfo.startTime,
                                                    "PPPppp",
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-red-500" />
                                        <p>
                                            <span className="font-medium">
                                                To:{" "}
                                            </span>
                                            <span>
                                                {format(
                                                    currentSessionInfo.endTime,
                                                    "PPPppp",
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center md:hidden">
                                <ArrowRight className="text-muted-foreground h-5 w-5" />
                            </div>

                            <div className="space-y-3 rounded-lg border border-green-200 bg-green-50/50 p-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <h5 className="font-medium text-green-700">
                                        Requested Schedule
                                    </h5>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-green-500" />
                                        <p>
                                            <span className="font-medium">
                                                From:{" "}
                                            </span>
                                            <span>
                                                {format(
                                                    currentSessionInfo.newStartTime,
                                                    "PPPppp",
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-green-500" />
                                        <p>
                                            <span className="font-medium">
                                                To:{" "}
                                            </span>
                                            <span>
                                                {format(
                                                    currentSessionInfo.newEndTime,
                                                    "PPPppp",
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Arrow for desktop */}
                        <div className="hidden items-center justify-center md:flex">
                            <div className="bg-background absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border p-2 shadow-sm">
                                <ArrowRight className="text-muted-foreground h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Notes Section */}

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText className="text-muted-foreground h-4 w-4" />
                            <Label className="font-medium">
                                Additional Notes
                            </Label>
                        </div>
                        <div className="bg-muted/30 rounded-lg border p-4">
                            <p className="text-sm leading-relaxed">
                                {currentSessionInfo.notes ||
                                    "No additional notes provided."}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 sm:flex-none"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReject}
                        className="flex-1 text-white sm:flex-none"
                        loading={loading}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                    </Button>
                    <Button
                        onClick={handleApprove}
                        className="flex-1 bg-green-600 hover:bg-green-700 sm:flex-none"
                        loading={loading}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
