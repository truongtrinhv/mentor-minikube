// Converts a normal Cloudinary URL to a download URL. This function only works for Cloudinary URLs.
export const convertToDownloadUrl = (
    cloudinaryUrl: string,
    filename: string = "",
) => {
    try {
        const url = new URL(cloudinaryUrl);
        const parts = url.pathname.split("/");

        const uploadIndex = parts.findIndex((part) => part === "upload");
        if (uploadIndex === -1) {
            throw new Error(
                "Invalid Cloudinary URL: 'upload' segment not found",
            );
        }

        const attachmentStr = filename
            ? `fl_attachment:${filename}`
            : "fl_attachment";

        if (!parts.includes(attachmentStr)) {
            parts.splice(uploadIndex + 1, 0, attachmentStr);
        }

        url.pathname = parts.join("/");
        return url.toString();
    } catch (error: any) {
        console.error("Error converting Cloudinary URL:", error.message);
        return cloudinaryUrl;
    }
};
