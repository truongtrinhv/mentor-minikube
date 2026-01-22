/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import SearchInput from "@/common/components/input/search-input";
import DataTable from "@/common/components/table/data-table";
import DataTablePagination from "@/common/components/table/data-table-pagination";
import TableTopBar from "@/common/components/table/data-table-topbar";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/common/components/ui/alert";
import { Button } from "@/common/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/common/components/ui/dialog";

import ApplicationDetails from "./application-details";
import { getColumns } from "./columns";
import DecisionDialog from "./decision-dialog";
import FilePreviewDialog from "./file-preview-dialog";

import mentorApprovalService from "../services/mentorApprovalService";
import type {
    ApplicationRequestQueryParams,
    DecisionType,
    Document,
    MentorApplicationResponse,
    Notification,
    PreviewFile,
} from "../types";
import { defaultApplicationRequestQueryParams } from "../types";
import {
    approveApplicationSchema,
    rejectApplicationSchema,
    requestUpdateSchema,
} from "../utils/schemas";

export function MentorApprovalsForm() {
    const [applications, setApplications] = useState<
        MentorApplicationResponse[]
    >([]);
    const [selectedApplication, setSelectedApplication] =
        useState<MentorApplicationResponse | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [decision, setDecision] = useState<DecisionType>(null);
    const [comments, setComments] = useState("");
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [notification, setNotification] = useState<Notification | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // File preview state
    const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    // Pagination and search state
    const [query, setQuery] = useState<ApplicationRequestQueryParams>(
        defaultApplicationRequestQueryParams,
    );

    useEffect(() => {
        handleGetList();
    }, [query]);

    const columns = getColumns(handleViewDetails);

    // Fetch applications list from API
    const handleGetList = () => {
        setIsLoading(true);
        mentorApprovalService
            .getApplicationRequests(query)
            .then((res) => {
                console.log("res: ", res);
                setApplications(res.data?.items ?? []);
                setTotalCount(res.data?.totalCount ?? 0);
            })
            .finally(() => setIsLoading(false));
    };

    // Handle search
    const handleSearch = (search: string) => {
        setQuery({ ...query, pageNumber: 1, search });
    };

    // View application details
    async function handleViewDetails(application: MentorApplicationResponse) {
        setIsLoading(true);
        await mentorApprovalService
            .getApplicationRequestDetail(application.id)
            .then((res) => {
                if (res.data) {
                    console.log("res.data: ", res.data);
                    setSelectedApplication(res.data);
                    setIsDetailsOpen(true);
                }
            })
            .finally(() => setIsLoading(false));
    }

    // Close details dialog
    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSelectedApplication(null);
    };

    // Handle document preview
    const handlePreviewDocument = (document: Document) => {
        setPreviewFile({
            url: document.url,
            type: document.type,
            file: document.file || new File([], document.name),
        });
        setIsPreviewOpen(true);
        setPreviewError(false);
    };

    // Handle preview error
    const handlePreviewError = () => {
        setPreviewError(true);
    };

    // Open confirm dialog
    const handleOpenConfirmDialog = (
        action: DecisionType,
        application: MentorApplicationResponse,
    ) => {
        setSelectedApplication(application);
        setDecision(action);
        setIsConfirmDialogOpen(true);
    };

    // Close confirm dialog
    const handleCloseConfirmDialog = () => {
        setIsConfirmDialogOpen(false);
        setDecision(null);
        setComments("");
    };

    // Submit decision
    const handleSubmitDecision = async () => {
        if (!selectedApplication || !decision) return;

        if (!selectedApplication.id || selectedApplication.id.trim() === "") {
            toast.error("Application ID is invalid. Please try again.");
            return;
        }

        setIsLoading(true);
        try {
            switch (decision) {
                case "approve": {
                    const approveResult = approveApplicationSchema.safeParse({
                        note: comments.trim(),
                    });
                    if (!approveResult.success) {
                        const errorMessages = approveResult.error.format();
                        if (errorMessages.note?._errors) {
                            toast.error(errorMessages.note._errors[0]);
                            return;
                        }
                    }

                    await mentorApprovalService.approveApplication(
                        selectedApplication.id,
                    );
                    toast.success(
                        `Successfully approved ${selectedApplication.fullName}'s application`,
                    );
                    break;
                }

                case "reject": {
                    const rejectResult = rejectApplicationSchema.safeParse({
                        note: comments.trim(),
                    });
                    if (!rejectResult.success) {
                        const errorMessages = rejectResult.error.format();
                        if (errorMessages.note?._errors) {
                            toast.error(errorMessages.note._errors[0]);
                            return;
                        }
                    }

                    await mentorApprovalService.rejectApplication(
                        selectedApplication.id,
                        comments.trim(),
                    );
                    toast.success(
                        `Successfully rejected ${selectedApplication.fullName}'s application`,
                    );
                    break;
                }

                case "update": {
                    const updateResult = requestUpdateSchema.safeParse({
                        note: comments.trim(),
                    });
                    if (!updateResult.success) {
                        const errorMessages = updateResult.error.format();
                        if (errorMessages.note?._errors) {
                            toast.error(errorMessages.note._errors[0]);
                            return;
                        }
                    }

                    await mentorApprovalService.requestUpdate({
                        id: selectedApplication.id.trim(),
                        note: comments.trim(),
                    });
                    toast.success(
                        `Update request sent to ${selectedApplication.fullName}`,
                    );
                    break;
                }
            }

            // Refresh application list
            handleGetList();

            // Show notification
            const messageMap = {
                approve: `Successfully approved ${selectedApplication.fullName}'s application`,
                reject: `Successfully rejected ${selectedApplication.fullName}'s application`,
                update: `Update request sent to ${selectedApplication.fullName}`,
            };

            setNotification({
                type: decision === "reject" ? "error" : "success",
                title:
                    decision === "approve"
                        ? "Application Approved"
                        : decision === "reject"
                          ? "Application Rejected"
                          : "Update Requested",
                message: messageMap[decision],
            });

            // Hide notification after 5 seconds
            setTimeout(() => {
                setNotification(null);
            }, 5000);

            // Close dialogs
            handleCloseConfirmDialog();
            handleCloseDetails();
        } catch (error: any) {
            console.error("Error submitting decision:", error);

            const errorMessage =
                error.response?.data?.errors?.[0]?.message ||
                error.response?.data?.message ||
                "An error occurred while processing your request. Please try again.";

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const columnsWithNumbering: ColumnDef<MentorApplicationResponse>[] = [
        {
            id: "index",
            header: "No.",
            cell: ({ row }) => (
                <div>
                    {(query.pageNumber - 1) * query.pageSize + row.index + 1}
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        ...columns,
    ];

    return (
        <div className="rounded-lg border p-4 shadow-sm">
            {/* Notification */}
            {notification && (
                <Alert
                    variant={
                        notification.type === "success"
                            ? "default"
                            : "destructive"
                    }
                    className="mb-4"
                >
                    <AlertTitle>{notification.title}</AlertTitle>
                    <AlertDescription>{notification.message}</AlertDescription>
                </Alert>
            )}

            {/* Table header */}
            <TableTopBar
                title="Mentor Approvals"
                subtitle="List of mentor applications pending approval"
            />

            {/* Search */}
            <div className="mb-4 flex space-x-3">
                <SearchInput onSearch={handleSearch} />
            </div>

            {/* Applications table */}
            <div className="space-y-4">
                <DataTable
                    data={applications}
                    columns={columnsWithNumbering}
                    loading={isLoading}
                />
                <DataTablePagination
                    pageSize={query.pageSize}
                    pageNumber={query.pageNumber}
                    totalRecords={totalCount}
                    onPageNumberChanged={(pageNumber: number) =>
                        setQuery({ ...query, pageNumber })
                    }
                    onPageSizeChanged={(pageSize: number) =>
                        setQuery({ ...query, pageNumber: 1, pageSize })
                    }
                />
            </div>

            {/* Application details dialog */}
            {selectedApplication && (
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Application Details</DialogTitle>
                            <DialogDescription>
                                Reviewing application from{" "}
                                {selectedApplication.fullName}
                            </DialogDescription>
                        </DialogHeader>

                        <ApplicationDetails
                            application={selectedApplication}
                            onPreviewDocument={handlePreviewDocument}
                            onRequestUpdate={() =>
                                handleOpenConfirmDialog(
                                    "update",
                                    selectedApplication,
                                )
                            }
                            onApprove={() =>
                                handleOpenConfirmDialog(
                                    "approve",
                                    selectedApplication,
                                )
                            }
                            onReject={() =>
                                handleOpenConfirmDialog(
                                    "reject",
                                    selectedApplication,
                                )
                            }
                        />

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={handleCloseDetails}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Decision dialog */}
            <DecisionDialog
                open={isConfirmDialogOpen}
                onOpenChange={setIsConfirmDialogOpen}
                decision={decision}
                comments={comments}
                onCommentsChange={(value) => setComments(value)}
                onConfirm={handleSubmitDecision}
                onCancel={handleCloseConfirmDialog}
            />

            {/* File preview dialog */}
            <FilePreviewDialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                previewFile={previewFile}
                previewError={previewError}
                onPreviewError={handlePreviewError}
            />
        </div>
    );
}
