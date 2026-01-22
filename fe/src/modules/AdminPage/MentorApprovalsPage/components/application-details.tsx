import { Check, Eye, FileText, RefreshCw, X } from "lucide-react";
import React from "react";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/common/components/ui/avatar";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { formatDateTimeForDisplayEn } from "@/modules/MentorPages/ApplicationStatusPage/utils/dateTimeUtils";

import StatusBadge from "./status-badge";

import { ApplicationStatus } from "../types";
import type { Document, MentorApplicationResponse } from "../types";
import { getFileExtension } from "../utils/file-helpers";

type ApplicationDetailsProps = {
    application: MentorApplicationResponse;
    onPreviewDocument: (document: Document) => void;
    onRequestUpdate: () => void;
    onApprove: () => void;
    onReject: () => void;
};

export const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
    application,
    onPreviewDocument,
    onRequestUpdate,
    onApprove,
    onReject,
}) => {
    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const formatDate = (dateString?: string) => {
        return formatDateTimeForDisplayEn(dateString);
    };

    const handlePreviewDocument = (doc: any) => {
        const document: Document = {
            id: doc.id || (Math.random() * 1000).toString(),
            name: doc.fileName,
            url: doc.filePath,
            type: getFileExtension(doc.fileName),
        };
        onPreviewDocument(document);
    };

    return (
        <div className="space-y-4">
            {/* Applicant Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Applicant Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                        <Avatar className="h-20 w-20">
                            {application.avatarUrl ? (
                                <AvatarImage
                                    src={application.avatarUrl}
                                    alt={application.fullName}
                                />
                            ) : (
                                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                    {getInitials(application.fullName)}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl font-semibold break-words">
                                {application.fullName}
                            </h2>
                            <p className="text-muted-foreground mb-3 text-sm break-all">
                                {application.mentorEmail}
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                                {(application.mentorExpertises || []).map(
                                    (skill, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="break-words"
                                        >
                                            {skill}
                                        </Badge>
                                    ),
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <StatusBadge status={application.status} />
                            <p className="text-muted-foreground mt-2 text-xs">
                                Applied: {formatDate(application.summitted)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notes Card - Show if there are notes */}
            {application.note && (
                <Card className="border-blue-200 dark:border-blue-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-base font-medium">
                            Admin Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-sm break-all">{application.note}</p>
                    </CardContent>
                </Card>
            )}

            {/* Decision Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Application Decision</CardTitle>
                    <CardDescription>
                        Update the status of this mentor application
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {application.status === ApplicationStatus.Pending && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Button
                                    onClick={onRequestUpdate}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <RefreshCw size={16} className="mr-2" />
                                    Request Update
                                </Button>
                                <Button
                                    onClick={onApprove}
                                    className="flex-1 bg-green-600"
                                >
                                    <Check size={16} className="mr-2" />
                                    Approve
                                </Button>
                                <Button
                                    onClick={onReject}
                                    variant="destructive"
                                    className="dark:black flex-1 text-white"
                                >
                                    <X size={16} className="mr-2" />
                                    Reject
                                </Button>
                            </div>
                        )}

                        {application.status ===
                            ApplicationStatus.UnderReview && (
                            <div className="p-6 text-center">
                                <RefreshCw
                                    size={24}
                                    className="mx-auto mb-2 text-blue-500"
                                />
                                <p className="mb-1 font-medium">
                                    Application Revision Required
                                </p>
                                <p className="text-muted-foreground mb-4 text-sm">
                                    The applicant has been asked to update their
                                    application. You cannot approve or reject
                                    until they resubmit.
                                </p>
                                {application.note && (
                                    <div className="bg-muted rounded-md p-3 text-left text-sm">
                                        <p className="mb-1 font-medium">
                                            Revision Request Notes:
                                        </p>
                                        <p className="break-all">
                                            {application.note}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {application.status === ApplicationStatus.Approved && (
                            <div className="p-6 text-center">
                                <Check
                                    size={24}
                                    className="mx-auto mb-2 text-green-500"
                                />
                                <p className="mb-1 font-medium">
                                    Application Approved
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    This application has been approved and the
                                    applicant has been granted mentor access.
                                </p>
                            </div>
                        )}

                        {application.status === ApplicationStatus.Rejected && (
                            <div className="p-6 text-center">
                                <X
                                    size={24}
                                    className="mx-auto mb-2 text-red-500"
                                />
                                <p className="mb-1 font-medium">
                                    Application Rejected
                                </p>
                                <p className="text-muted-foreground mb-4 text-sm">
                                    This application has been rejected.
                                </p>
                                {application.note && (
                                    <div className="bg-muted rounded-md p-3 text-left text-sm">
                                        <p className="mb-1 font-medium">
                                            Rejection Reason:
                                        </p>
                                        <p className="break-all">
                                            {application.note}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Education Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="break-all">{application.education}</p>
                </CardContent>
            </Card>

            {/* Work Experience Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Work Experience</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="break-all">{application.workExperience}</p>
                </CardContent>
            </Card>

            {/* Certifications Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <ul className="list-disc space-y-2 pl-5">
                            {(application.mentorCertifications || []).map(
                                (cert, index) => (
                                    <li
                                        key={index}
                                        className="text-foreground break-all"
                                    >
                                        {cert}
                                    </li>
                                ),
                            )}
                            {(application.mentorCertifications || []).length ===
                                0 && (
                                <p className="text-muted-foreground">
                                    No certifications provided
                                </p>
                            )}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Motivation Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Motivation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="break-all">{application.description}</p>
                </CardContent>
            </Card>

            {/* Supporting Documents Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Supporting Documents</CardTitle>
                    <CardDescription>
                        Review the documents submitted by the applicant
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {(application.applicationRequestDocuments || []).map(
                            (doc, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between rounded-md border p-3"
                                >
                                    <div className="mr-4 flex min-w-0 flex-1 items-center">
                                        <FileText
                                            size={20}
                                            className="text-muted-foreground mr-2 flex-shrink-0"
                                        />
                                        <span className="text-sm break-all">
                                            {doc.fileName}
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePreviewDocument(doc)
                                        }
                                        className="flex-shrink-0"
                                    >
                                        <Eye size={16} className="mr-2" />
                                        Preview
                                    </Button>
                                </div>
                            ),
                        )}
                        {(!application.applicationRequestDocuments ||
                            application.applicationRequestDocuments.length ===
                                0) && (
                            <p className="text-muted-foreground">
                                No documents submitted
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ApplicationDetails;
