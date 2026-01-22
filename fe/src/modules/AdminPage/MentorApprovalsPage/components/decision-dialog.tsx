import React from "react";

import { Button } from "@/common/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/common/components/ui/dialog";
import { Textarea } from "@/common/components/ui/textarea";

import type { DecisionType } from "../types";

type DecisionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    decision: DecisionType;
    comments: string;
    onCommentsChange: (comments: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
};

export const DecisionDialog: React.FC<DecisionDialogProps> = ({
    open,
    onOpenChange,
    decision,
    comments,
    onCommentsChange,
    onConfirm,
    onCancel,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {decision === "approve"
                            ? "Approve Application"
                            : decision === "reject"
                              ? "Reject Application"
                              : "Request Application Update"}
                    </DialogTitle>
                    <DialogDescription>
                        {decision === "approve"
                            ? "Are you sure you want to approve this application? This will grant mentor access to the platform."
                            : decision === "reject"
                              ? "Are you sure you want to reject this application? The applicant will be notified."
                              : "The applicant will be notified to update their application with the requested information."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="comments"
                            className="text-sm font-medium"
                        >
                            {decision === "update"
                                ? "What information do you need from the applicant?"
                                : decision === "reject"
                                  ? "Rejection Reason (*)"
                                  : "Comments"}
                        </label>
                        <Textarea
                            id="comments"
                            placeholder={
                                decision === "reject"
                                    ? "Please provide a reason for rejection..."
                                    : decision === "update"
                                      ? "Please specify what information needs to be updated or added..."
                                      : "Add comments to include in the notification email..."
                            }
                            value={comments}
                            onChange={(e) => onCommentsChange(e.target.value)}
                            required={
                                decision === "reject" || decision === "update"
                            }
                            className="field-sizing-fixed resize-none"
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant={
                            decision === "approve"
                                ? "default"
                                : decision === "reject"
                                  ? "destructive"
                                  : "outline"
                        }
                        onClick={onConfirm}
                        disabled={
                            (decision === "reject" || decision === "update") &&
                            !comments.trim()
                        }
                    >
                        {decision === "approve"
                            ? "Approve"
                            : decision === "reject"
                              ? "Reject"
                              : "Request Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DecisionDialog;
