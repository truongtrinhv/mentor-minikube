import type { ApplicationStatus } from "@/modules/AdminPage/MentorApprovalsPage/types";
import {
    SUPPORTED_DOCUMENT_TYPES,
    SUPPORTED_IMAGE_TYPES,
    SUPPORTED_VIDEO_TYPES,
} from "@/modules/AdminPage/MentorApprovalsPage/utils/file-helpers";

export type ApplicationDocument = {
    id?: string;
    fileName: string;
    filePath: string;
    fileContent?: File;
};

export type CurrentUserApplication = {
    id: string;
    description: string;
    education: string;
    workExperience: string;
    certifications: string[];
    status: ApplicationStatus;
    note: string | null;
    summitted: string;
    fullName?: string;
    mentorEmail?: string;
    mentorExpertises?: string[];
    mentorCertifications?: string[];
    avatarUrl?: string;
    applicationRequestDocuments?: ApplicationDocument[];
    applicationDocuments?: ApplicationDocument[];
};

export const ALL_ALLOWED_EXTENSIONS = [
    // Images
    ...SUPPORTED_IMAGE_TYPES.map((ext) => `.${ext}`),
    // Videos
    ...SUPPORTED_VIDEO_TYPES.map((ext) => `.${ext}`),
    // Documents
    ...SUPPORTED_DOCUMENT_TYPES.map((ext) => `.${ext}`),
];
