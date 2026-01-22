/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, FileText, Loader2, PlusCircle, Upload, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import LoadingSpinner from "@/common/components/loading-spinner";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/common/components/ui/accordion";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
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
import { Progress } from "@/common/components/ui/progress";
import { Separator } from "@/common/components/ui/separator";
import { Textarea } from "@/common/components/ui/textarea";
import authService from "@/common/services/authServices";
import type { CurrentUser } from "@/common/types/auth";
import FilePreviewDialog from "@/modules/AdminPage/MentorApprovalsPage/components/file-preview-dialog";
import { ApplicationStatus } from "@/modules/AdminPage/MentorApprovalsPage/types";
import type { PreviewFile } from "@/modules/AdminPage/MentorApprovalsPage/types";
import { getFileExtension } from "@/modules/AdminPage/MentorApprovalsPage/utils/file-helpers";

import { applicationStatusService } from "../../ApplicationStatusPage/services/applicationStatusService";
import { ALL_ALLOWED_EXTENSIONS } from "../../ApplicationStatusPage/types";
import { convertLocalDateToUtc } from "../../ApplicationStatusPage/utils/dateTimeUtils";
import { mentorApplicationService } from "../services/mentorApplicationService";
import type { FormValues } from "../types";
import { formSchema } from "../utils/schemas";

type ApplicationFormProps = {
    onApplicationCreated?: () => void;
    skipApplicationCheck?: boolean;
};

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
    onApplicationCreated,
    skipApplicationCheck = false,
}) => {
    const [progress, setProgress] = useState(0);
    const [files, setFiles] = useState<File[]>([]);
    const [certificationList, setCertificationList] = useState<string[]>([]);
    const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewError, setPreviewError] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (skipApplicationCheck) {
            fetchCurrentUser();
            return;
        }

        const checkExistingApplication = async () => {
            try {
                const response =
                    await applicationStatusService.getCurrentUserApplication();

                if (response.isSuccess && response.data) {
                    const status = response.data.status;

                    if (
                        status === ApplicationStatus.Pending ||
                        status === ApplicationStatus.UnderReview ||
                        status === ApplicationStatus.Rejected
                    ) {
                        toast.info(
                            "You have already applied for mentor. Please check your application status.",
                        );
                        if (onApplicationCreated) {
                            onApplicationCreated();
                        } else {
                            navigate("/mentor/applications/status");
                        }
                        return;
                    }
                }

                fetchCurrentUser();
            } catch (error) {
                console.error("Error checking existing application:", error);
                fetchCurrentUser();
            }
        };

        checkExistingApplication();
    }, [navigate, onApplicationCreated, skipApplicationCheck]);

    // Fetch current user data
    const fetchCurrentUser = async () => {
        try {
            setLoading(true);
            const response = await authService.getCurrentUser();
            if (response.data) {
                setCurrentUser(response.data);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            education: "",
            workExperience: "",
            certifications: [],
            description: "",
            status: ApplicationStatus.Pending,
            applicationDocuments: [],
            note: null,
        },
    });

    const calculateProgress = () => {
        const formValues = form.getValues();
        let fieldsCompleted = 0;
        const totalFields = 3;

        if (formValues.education?.length >= 10) fieldsCompleted++;
        if (formValues.workExperience?.length >= 10) fieldsCompleted++;
        if (formValues.description?.length >= 10) fieldsCompleted++;

        const newProgress = Math.round((fieldsCompleted / totalFields) * 100);
        setProgress(newProgress);
    };

    useEffect(() => {
        const subscription = form.watch(() => calculateProgress());
        return () => subscription.unsubscribe();
    }, [form.watch]);

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        try {
            setIsSubmitting(true);

            if (files.length > 0) {
                const formData = new FormData();

                formData.append("education", values.education);
                formData.append("workExperience", values.workExperience);
                formData.append("description", values.description);
                formData.append("status", values.status.toString());
                const currentUtcTime = convertLocalDateToUtc(new Date());
                formData.append("submitted", currentUtcTime);

                if (values.certifications && values.certifications.length > 0) {
                    values.certifications.forEach((cert, index) => {
                        formData.append(`certifications[${index}]`, cert);
                    });
                }

                if (values.note) {
                    formData.append("note", values.note);
                }

                files.forEach((file, index) => {
                    formData.append(
                        `applicationDocuments[${index}].fileName`,
                        file.name,
                    );
                    formData.append(
                        `applicationDocuments[${index}].fileContent`,
                        file,
                    );
                    formData.append(
                        `applicationDocuments[${index}].filePath`,
                        "temp",
                    );
                });

                const response =
                    await mentorApplicationService.createApplicationWithFormData(
                        formData,
                    );

                if (response.isSuccess) {
                    toast.success("Application submitted successfully!");
                    setIsSubmitSuccessful(true);
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    if (onApplicationCreated) {
                        onApplicationCreated();
                    } else {
                        navigate("/mentor/applications/status");
                    }
                } else {
                    console.error("API Error:", response.errors);
                }
            } else {
                const formData = new FormData();
                formData.append("education", values.education);
                formData.append("workExperience", values.workExperience);
                formData.append("description", values.description);
                formData.append("status", values.status.toString());
                const currentUtcTime = convertLocalDateToUtc(new Date());
                formData.append("submitted", currentUtcTime);

                if (values.certifications && values.certifications.length > 0) {
                    values.certifications.forEach((cert, index) => {
                        formData.append(`certifications[${index}]`, cert);
                    });
                }

                const response =
                    await mentorApplicationService.createApplicationWithFormData(
                        formData,
                    );

                if (response.isSuccess) {
                    toast.success("Application submitted successfully!");
                    setIsSubmitSuccessful(true);
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    if (onApplicationCreated) {
                        onApplicationCreated();
                    } else {
                        navigate("/mentor/applications/status");
                    }
                } else {
                    console.error("API Error:", response.errors);
                }
            }
        } catch (error: any) {
            console.error("Error submitting application:", error);
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

    const handleViewFile = (file: File) => {
        const fileUrl = URL.createObjectURL(file);
        const fileType = getFileExtension(file.name);
        setPreviewFile({ url: fileUrl, type: fileType, file });
        setPreviewOpen(true);
        setPreviewError(false);
    };

    const handlePreviewError = () => {
        setPreviewError(true);
    };

    // Clean up object URL when dialog closes
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

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="bg-card mx-auto max-w-4xl rounded-lg p-6 shadow-md dark:shadow-gray-800">
            <div className="mb-6">
                <h1 className="text-foreground mb-2 text-2xl font-bold">
                    Mentor Application Form
                </h1>
                <p className="text-muted-foreground mb-4">
                    Please fill out the form below to apply as a mentor.
                </p>
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-foreground text-sm font-medium">
                        Completion: {progress}%
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* User Profile Information */}
            <Card className="bg-muted/30 mb-8">
                <CardContent className="p-6">
                    {loading ? (
                        <div className="flex h-20 items-center justify-center">
                            <LoadingSpinner />
                            <p>Loading...</p>
                        </div>
                    ) : currentUser ? (
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                            <Avatar className="h-20 w-20">
                                {currentUser.avatarUrl ? (
                                    <AvatarImage
                                        src={currentUser.avatarUrl}
                                        alt={currentUser.fullName}
                                    />
                                ) : (
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                        {getInitials(currentUser.fullName)}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1 text-center sm:text-left">
                                <h2 className="text-xl font-semibold">
                                    {currentUser.fullName}
                                </h2>
                                <p className="text-muted-foreground mb-3 text-sm">
                                    {currentUser.email}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 text-center">
                            <p className="text-muted-foreground">
                                Unable to load user information.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

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
                                            className="field-sizing-fixed resize-none break-words"
                                            rows={7}
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
                                            className="field-sizing-fixed resize-none break-words"
                                            rows={7}
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
                                                            className="field-sizing-fixed resize-none break-words"
                                                            rows={3}
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
                                            className="field-sizing-fixed resize-none break-words"
                                            rows={7}
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
                            <div className="mb-4">
                                <Label htmlFor="file-upload">
                                    Upload Documents
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
                                    <Label>Uploaded Files</Label>
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

                    {/* Submit Button */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            className="w-full sm:w-auto"
                            disabled={isSubmitting || isSubmitSuccessful}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : isSubmitSuccessful ? (
                                "Application Submitted"
                            ) : (
                                "Submit Application"
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

export default ApplicationForm;
