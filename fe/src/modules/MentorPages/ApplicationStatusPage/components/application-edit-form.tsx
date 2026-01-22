import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, FileText, Loader2, PlusCircle, Upload, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/common/components/ui/accordion";
import { Button } from "@/common/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Separator } from "@/common/components/ui/separator";
import { Textarea } from "@/common/components/ui/textarea";
import FilePreviewDialog from "@/modules/AdminPage/MentorApprovalsPage/components/file-preview-dialog";
import type { PreviewFile } from "@/modules/AdminPage/MentorApprovalsPage/types";
import { ApplicationStatus } from "@/modules/AdminPage/MentorApprovalsPage/types";
import { getFileExtension } from "@/modules/AdminPage/MentorApprovalsPage/utils/file-helpers";

import type { FormValues } from "../../RequestApplicationPage/types";
import { formSchema } from "../../RequestApplicationPage/utils/schemas";
import { applicationStatusService } from "../services/applicationStatusService";
import {
    ALL_ALLOWED_EXTENSIONS,
    type ApplicationDocument,
    type CurrentUserApplication,
} from "../types";
import { convertLocalDateToUtc } from "../utils/dateTimeUtils";

type ApplicationEditFormProps = {
    application: CurrentUserApplication;
    onUpdateSuccess: () => void;
};

export const ApplicationEditForm: React.FC<ApplicationEditFormProps> = ({
    application,
    onUpdateSuccess,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<ApplicationDocument[]>(
        [],
    );
    const [certificationList, setCertificationList] = useState<string[]>(
        application.certifications || [],
    );
    const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewError, setPreviewError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (application.applicationRequestDocuments) {
            setExistingFiles(application.applicationRequestDocuments);
        } else if (application.applicationDocuments) {
            setExistingFiles(application.applicationDocuments);
        }
    }, [application]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            education: application.education,
            workExperience: application.workExperience,
            certifications: application.certifications || [],
            description: application.description,
            status: application.status,
            applicationDocuments: [],
            note: application.note || null,
        },
    });

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        if (application.status !== ApplicationStatus.UnderReview) {
            toast.error(
                "You can only update applications that are under review.",
            );
            return;
        }

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append("id", application.id || "");
            formData.append("education", values.education);
            formData.append("workExperience", values.workExperience);
            formData.append("description", values.description);
            if (values.certifications && values.certifications.length > 0) {
                values.certifications.forEach((cert, index) => {
                    formData.append(`certifications[${index}]`, cert);
                });
            }
            const currentUtcTime = convertLocalDateToUtc(new Date());

            formData.append("submitted", currentUtcTime);
            existingFiles.forEach((file, index) => {
                formData.append(
                    `applicationDocuments[${index}].fileName`,
                    file.fileName,
                );
                formData.append(
                    `applicationDocuments[${index}].filePath`,
                    file.filePath,
                );
                formData.append(
                    `applicationDocuments[${index}].fileContent`,
                    new Blob([]),
                );
            });
            files.forEach((file, index) => {
                const fileIndex = existingFiles.length + index;
                formData.append(
                    `applicationDocuments[${fileIndex}].fileName`,
                    file.name || "document_" + index,
                );
                formData.append(
                    `applicationDocuments[${fileIndex}].fileContent`,
                    file,
                );
            });

            await applicationStatusService.updateApplication(formData);

            onUpdateSuccess();
        } catch (error: any) {
            console.error("Error updating application:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (!fileList) return;

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const fileExt = "." + getFileExtension(file.name);

            if (!ALL_ALLOWED_EXTENSIONS.includes(fileExt)) {
                toast.error(
                    `File extension '${fileExt}' is not supported. Allowed extensions: ${ALL_ALLOWED_EXTENSIONS.join(", ")}.`,
                );
                continue;
            }

            setFiles((prevFiles) => [...prevFiles, file]);
        }

        event.target.value = "";
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleRemoveExistingFile = (index: number) => {
        setExistingFiles((prevFiles) =>
            prevFiles.filter((_, i) => i !== index),
        );
    };

    const handleViewFile = (file: File) => {
        const fileUrl = URL.createObjectURL(file);
        const fileType = getFileExtension(file.name);
        setPreviewFile({ url: fileUrl, type: fileType, file });
        setPreviewOpen(true);
        setPreviewError(false);
    };

    const handleViewExistingFile = (url: string, fileName: string) => {
        try {
            const fileType = getFileExtension(fileName);
            setPreviewFile({ url, type: fileType });
            setPreviewOpen(true);
            setPreviewError(false);
        } catch (error) {
            console.error("Error viewing file:", error);
        }
    };

    const handlePreviewError = () => {
        setPreviewError(true);
        console.error("Error previewing file");
    };

    useEffect(() => {
        if (!previewOpen && previewFile) {
            URL.revokeObjectURL(previewFile.url);
        }
    }, [previewOpen, previewFile]);

    const addCertification = () => {
        setCertificationList((prev) => [...prev, ""]);
    };

    const updateCertification = (index: number, value: string) => {
        const updatedList = [...certificationList];
        updatedList[index] = value;
        setCertificationList(updatedList);

        form.setValue(
            "certifications",
            updatedList.filter((cert) => cert.trim() !== ""),
        );
    };

    const removeCertification = (index: number) => {
        setCertificationList((prev) => prev.filter((_, i) => i !== index));

        const updatedList = certificationList.filter((_, i) => i !== index);
        form.setValue(
            "certifications",
            updatedList.filter((cert) => cert.trim() !== ""),
        );
    };

    if (application.status !== ApplicationStatus.UnderReview) {
        return (
            <div className="bg-muted/30 rounded-md p-6 text-center">
                <p className="mb-4 text-lg">
                    You can only update applications that are under review.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card mx-auto max-w-4xl rounded-lg p-6 shadow-md dark:shadow-gray-800">
            <div className="mb-6">
                <h1 className="text-foreground mb-2 text-2xl font-bold">
                    Update Your Application
                </h1>
                <p className="text-muted-foreground mb-4">
                    Please update the requested information and submit your
                    application again.
                </p>
            </div>

            <Separator className="my-6" />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    {/* Education Section */}
                    <div className="space-y-4">
                        <h2 className="text-foreground border-b pb-2 text-xl font-semibold">
                            Education
                        </h2>
                        <FormField
                            control={form.control}
                            name="education"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Your Education{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            maxLength={2000}
                                            placeholder="Describe your educational background, degrees, institutions..."
                                            className="min-h-[150px] resize-y break-words"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Minimum 10 characters, maximum 2000
                                        characters.
                                        {field.value?.length > 0 &&
                                            ` (${field.value.length}/2000)`}
                                    </p>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Work Experience Section */}
                    <div className="space-y-4">
                        <h2 className="text-foreground border-b pb-2 text-xl font-semibold">
                            Work Experience
                        </h2>
                        <FormField
                            control={form.control}
                            name="workExperience"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Your Work Experience{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            maxLength={2000}
                                            placeholder="Describe your work experience, positions, companies..."
                                            className="min-h-[150px] resize-y break-words"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Minimum 10 characters, maximum 2000
                                        characters.
                                        {field.value?.length > 0 &&
                                            ` (${field.value.length}/2000)`}
                                    </p>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Certifications Section */}
                    <div className="space-y-4">
                        <h2 className="text-foreground border-b pb-2 text-xl font-semibold">
                            Certifications
                        </h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="certifications">
                                <AccordionTrigger className="text-base font-medium">
                                    My Certifications
                                </AccordionTrigger>
                                <AccordionContent>
                                    {certificationList.length > 0 ? (
                                        <div className="space-y-4">
                                            {certificationList.map(
                                                (cert, index) => (
                                                    <div
                                                        key={index}
                                                        className="space-y-2 rounded-md border p-4 dark:border-gray-700"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <Label className="font-medium">
                                                                Certification{" "}
                                                                {index + 1}
                                                            </Label>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive/90 h-8 px-2"
                                                                onClick={() =>
                                                                    removeCertification(
                                                                        index,
                                                                    )
                                                                }
                                                            >
                                                                <X size={16} />
                                                            </Button>
                                                        </div>

                                                        <Textarea
                                                            maxLength={2000}
                                                            value={cert}
                                                            onChange={(e) =>
                                                                updateCertification(
                                                                    index,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Describe your certification..."
                                                            className="min-h-[100px] w-full resize-y break-words"
                                                        />
                                                        <p className="text-muted-foreground text-xs">
                                                            Maximum 2000
                                                            characters.
                                                            {cert.length > 0 &&
                                                                ` (${cert.length}/2000)`}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">
                                            No certifications added yet.
                                        </p>
                                    )}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-4 w-full"
                                        onClick={addCertification}
                                    >
                                        <PlusCircle
                                            size={16}
                                            className="mr-2"
                                        />{" "}
                                        Add Certification
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Motivation Section */}
                    <div className="space-y-4">
                        <h2 className="text-foreground border-b pb-2 text-xl font-semibold">
                            Motivation
                        </h2>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Why do you want to become a mentor?{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            maxLength={2000}
                                            placeholder="Share your experience, expertise, and motivation to become a mentor..."
                                            className="min-h-[200px] resize-y break-words"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Minimum 10 characters, maximum 2000
                                        characters.
                                        {field.value?.length > 0 &&
                                            ` (${field.value.length}/2000)`}
                                    </p>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Supporting Documents */}
                    <div className="space-y-4">
                        <h2 className="text-foreground border-b pb-2 text-xl font-semibold">
                            Supporting Documents
                        </h2>
                        <div className="bg-muted/40 rounded-md p-4 dark:bg-gray-800/30">
                            {/* Existing Files */}
                            {existingFiles.length > 0 && (
                                <div className="mb-6">
                                    <Label>Existing Documents</Label>
                                    <div className="mt-2 max-h-60 space-y-2 overflow-y-auto">
                                        {existingFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="bg-background flex items-center justify-between rounded border p-2 dark:border-gray-700"
                                            >
                                                <div className="flex max-w-[80%] items-center gap-2 truncate">
                                                    <FileText size={16} />
                                                    <span className="truncate text-sm">
                                                        {file.fileName}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleViewExistingFile(
                                                                file.filePath,
                                                                file.fileName,
                                                            )
                                                        }
                                                        className="flex h-8 items-center px-2"
                                                    >
                                                        <Eye
                                                            size={16}
                                                            className="mr-1"
                                                        />{" "}
                                                        Preview
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemoveExistingFile(
                                                                index,
                                                            )
                                                        }
                                                        className="text-destructive hover:text-destructive/90 h-8 px-2"
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload New Files */}
                            <div className="mb-4">
                                <Label htmlFor="file-upload">
                                    Upload New Documents
                                </Label>
                                <p className="text-muted-foreground mb-2 text-sm">
                                    Upload any supporting documents (PDF, DOCX,
                                    images, videos, or audio files)
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            document
                                                .getElementById("file-upload")
                                                ?.click()
                                        }
                                        className="flex items-center gap-2"
                                    >
                                        <Upload size={16} />
                                        Select Files
                                    </Button>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        accept={ALL_ALLOWED_EXTENSIONS.join(
                                            ",",
                                        )}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>

                            {files.length > 0 && (
                                <div className="max-h-60 space-y-2 overflow-y-auto">
                                    <Label>New Files to Upload</Label>
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="bg-background flex items-center justify-between rounded border p-2 dark:border-gray-700"
                                        >
                                            <div className="flex max-w-[80%] items-center gap-2 truncate">
                                                <FileText size={16} />
                                                <span className="truncate text-sm">
                                                    {file.name}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleViewFile(file)
                                                    }
                                                    className="flex h-8 items-center px-2"
                                                >
                                                    <Eye
                                                        size={16}
                                                        className="mr-1"
                                                    />{" "}
                                                    Preview
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleRemoveFile(index)
                                                    }
                                                    className="text-destructive hover:text-destructive/90 h-8 px-2"
                                                >
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Notes Section */}
                    {application.note && (
                        <div className="space-y-4">
                            <h2 className="text-foreground border-b pb-2 text-xl font-semibold">
                                Admin Notes
                            </h2>
                            <div className="bg-muted/40 rounded-md p-4 dark:bg-gray-800/30">
                                <Label>Notes from Admin</Label>
                                <div className="bg-muted text-foreground mt-2 min-h-[100px] rounded-md p-3 text-sm">
                                    {application.note}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                navigate("/mentor/applications/status")
                            }
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Application"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>

            {/* File Preview Dialog */}
            <FilePreviewDialog
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                previewFile={previewFile}
                previewError={previewError}
                onPreviewError={handlePreviewError}
            />
        </div>
    );
};

export default ApplicationEditForm;
