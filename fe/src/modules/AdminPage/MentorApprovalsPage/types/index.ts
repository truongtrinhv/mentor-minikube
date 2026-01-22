export enum ApplicationStatus {
    Pending = 0,
    UnderReview = 1,
    Approved = 2,
    Rejected = 3,
}

export type ApplicationRequestDocumentResponse = {
    filePath: string;
    fileName: string;
};

export type Notification = {
    type: "success" | "error";
    title: string;
    message: string;
};

export type PreviewFile = {
    file?: File;
    url: string;
    type: string;
};

export type Document = {
    id: string;
    name: string;
    type: string;
    url: string;
    file?: File;
};

export type DecisionType = "approve" | "reject" | "update" | null;

export type MentorApplicationResponse = {
    id: string;
    education: string;
    workExperience: string;
    fullName: string;
    description?: string;
    status: ApplicationStatus;
    summitted: string;
    note?: string;
    mentorEmail?: string;
    mentorExpertises?: string[];
    mentorCertifications?: string[];
    applicationRequestDocuments?: ApplicationRequestDocumentResponse[];
    avatarUrl?: string;
};

export type ApplicationRequestQueryParams = {
    pageSize: number;
    pageNumber: number;
    search: string;
};

export const defaultApplicationRequestQueryParams: ApplicationRequestQueryParams =
    {
        pageSize: 10,
        pageNumber: 1,
        search: "",
    };

export type RequestUpdateApplicationDocumentRequest = {
    id: string;
    note: string;
};

export const SUPPORTED_EXTENSIONS = [
    "pdf",
    "docx",
    "png",
    "jpg",
    "jpeg",
    "mp4",
    "webm",
];
