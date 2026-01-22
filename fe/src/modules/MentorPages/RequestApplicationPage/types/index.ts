import type { UseFormReturn } from "react-hook-form";

import type { ApplicationStatus } from "@/modules/AdminPage/MentorApprovalsPage/types";

export type ApplicationDocument = {
    id?: string;
    fileName: string;
    filePath: string;
    fileContent?: File;
};

export type ApplicationRequest = {
    id: string;
    description: string;
    education: string;
    workExperience: string;
    certifications?: string[];
    status: ApplicationStatus;
    note: string | null;
    applicationDocuments?: ApplicationDocument[];
    applicationRequestDocuments?: ApplicationDocument[];
};

export type FormValues = {
    education: string;
    workExperience: string;
    certifications: string[];
    description: string;
    status: ApplicationStatus;
    applicationDocuments: ApplicationDocument[];
    note: string | null;
};

export type FormContextType = UseFormReturn<FormValues>;

export type SectionProps = {
    form: FormContextType;
    calculateProgress?: () => void;
};
