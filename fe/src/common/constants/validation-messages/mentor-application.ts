export const MENTOR_APPLICATION_VALIDATION_MESSAGES = {
    education: {
        required: "Education is required.",
        minLength: "Education must be at least 10 characters.",
        maxLength: "Education must be at most 2000 characters.",
    },
    workExperience: {
        required: "Work experience is required.",
        minLength: "Work experience must be at least 10 characters.",
        maxLength: "Work experience must be at most 2000 characters.",
    },
    certifications: {
        required: "Certifications are required.",
    },
    description: {
        required: "Description is required.",
        minLength: "Description must be at least 10 characters.",
        maxLength: "Description must be at most 2000 characters.",
    },
    applicationDocuments: {
        required: "Application documents are required.",
    },
    note: {
        maxLength: "Note must be at most 2000 characters.",
    },
    fileContent: {
        required: "File content is required.",
        maxSize: "File size cannot exceed 10MB.",
        extension: "File extension is not supported.",
    },
    filePath: {
        required: "File path is required.",
        maxLength: "File path must be at most 1000 characters.",
    },
    fileName: {
        required: "File name is required.",
        maxLength: "File name must be at most 1000 characters.",
    },
};
