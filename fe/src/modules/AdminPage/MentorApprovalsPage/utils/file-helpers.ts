export const SUPPORTED_IMAGE_TYPES = ["jpg", "jpeg", "png", "webp"];
export const SUPPORTED_VIDEO_TYPES = ["mp4", "mov"];
export const SUPPORTED_DOCUMENT_TYPES = ["pdf", "docx", "doc"];

export const getFileExtension = (fileName: string): string => {
    const parts = fileName.split(".");
    if (parts.length <= 1) return "";
    return parts[parts.length - 1].toLowerCase();
};

export const isImageFile = (fileName: string): boolean => {
    const extension = getFileExtension(fileName);
    return SUPPORTED_IMAGE_TYPES.includes(extension);
};

export const isVideoFile = (fileName: string): boolean => {
    const extension = getFileExtension(fileName);
    return SUPPORTED_VIDEO_TYPES.includes(extension);
};

export const isPdfFile = (fileName: string): boolean => {
    const extension = getFileExtension(fileName);
    return extension === "pdf";
};

export const isSupportedFile = (fileName: string): boolean => {
    const extension = getFileExtension(fileName);
    return [
        ...SUPPORTED_IMAGE_TYPES,
        ...SUPPORTED_VIDEO_TYPES,
        ...SUPPORTED_DOCUMENT_TYPES,
    ].includes(extension);
};

export const getFileType = (
    fileNameOrExtension: string,
): "image" | "video" | "pdf" | "other" => {
    const extension = fileNameOrExtension.startsWith(".")
        ? fileNameOrExtension.substring(1).toLowerCase()
        : getFileExtension(fileNameOrExtension);

    if (isImageFile(extension)) return "image";
    if (isVideoFile(extension)) return "video";
    if (extension === "pdf") return "pdf";
    return "other";
};
