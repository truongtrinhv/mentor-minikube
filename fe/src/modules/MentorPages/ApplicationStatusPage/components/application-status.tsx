import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import { Separator } from "@/common/components/ui/separator";
import { Textarea } from "@/common/components/ui/textarea";
import StatusBadge from "@/modules/AdminPage/MentorApprovalsPage/components/status-badge";
import { ApplicationStatus } from "@/modules/AdminPage/MentorApprovalsPage/types";

import { formatDateTimeForDisplayEn } from "../utils/dateTimeUtils";

type ApplicationStatusSectionProps = {
    status: ApplicationStatus;
    note: string;
    createdAt?: string;
    isReadOnly?: boolean;
    onChangeStatus?: (status: ApplicationStatus) => void;
    onNoteChange?: (note: string) => void;
    onSave?: () => void;
};

export default function ApplicationStatusSection({
    status,
    note,
    createdAt,
    isReadOnly = false,
    onNoteChange,
}: ApplicationStatusSectionProps) {
    const formatDate = (dateString?: string) => {
        return formatDateTimeForDisplayEn(dateString);
    };

    return (
        <Card className="mb-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold">
                    Application Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="text-muted-foreground text-sm font-medium">
                                Current Status
                            </div>
                            <StatusBadge status={status} />
                        </div>

                        <Separator className="my-2" />

                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <div>
                                <span className="text-muted-foreground font-medium">
                                    Created on:
                                </span>{" "}
                                <span className="text-foreground">
                                    {formatDate(createdAt)}
                                </span>
                            </div>
                        </div>

                        {status === ApplicationStatus.UnderReview ||
                        (note && note.trim().length > 0) ? (
                            <div className="mt-4 space-y-2">
                                <Label
                                    htmlFor="note"
                                    className="text-foreground font-medium"
                                >
                                    Notes
                                </Label>
                                {isReadOnly ? (
                                    <div className="bg-muted text-foreground overflow-wrap-anywhere min-h-[100px] rounded-md p-3 text-sm break-words">
                                        {note || "No notes available."}
                                    </div>
                                ) : (
                                    <Textarea
                                        id="note"
                                        value={note || ""}
                                        onChange={(e) =>
                                            onNoteChange?.(e.target.value)
                                        }
                                        placeholder="Enter notes (admin only)"
                                        className="min-h-[100px] break-words"
                                        disabled={isReadOnly}
                                    />
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
