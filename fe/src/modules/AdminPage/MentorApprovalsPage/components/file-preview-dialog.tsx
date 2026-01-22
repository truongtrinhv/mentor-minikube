import { saveAs } from "file-saver";
import { AlertCircle, Download } from "lucide-react";
import React, { useEffect, useState } from "react";
import FileViewer from "react-file-viewer";

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
    DialogHeader,
    DialogTitle,
} from "@/common/components/ui/dialog";

import { type PreviewFile, SUPPORTED_EXTENSIONS } from "../types";

type FilePreviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    previewFile: PreviewFile | null;
    previewError: boolean;
    onPreviewError: () => void;
};

const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({
    open,
    onOpenChange,
    previewFile,
    previewError,
    onPreviewError,
}) => {
    const [fileType, setFileType] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [directUrl, setDirectUrl] = useState<string | null>(null);

    useEffect(() => {
        if (previewFile && previewFile.type) {
            const type = previewFile.type.toLowerCase();
            setFileType(type);
            setIsSupported(SUPPORTED_EXTENSIONS.includes(type));
            setDirectUrl(previewFile.url);
        } else {
            setFileType(null);
            setIsSupported(false);
            setDirectUrl(null);
        }
    }, [previewFile]);

    if (!previewFile) {
        return null;
    }

    const handleDownload = () => {
        if (previewFile?.url) {
            const downloadUrl = previewFile.url;

            const fileName =
                previewFile.file?.name || `file.${previewFile.type}`;

            fetch(downloadUrl)
                .then((response) => response.blob())
                .then((blob) => {
                    saveAs(blob, fileName);
                })
                .catch((error) => {
                    console.error("Download error:", error);
                });
        }
    };

    const onError = (error: Error) => {
        console.error("Error in file viewer:", error);
        onPreviewError();
    };

    const isPdf = fileType === "pdf";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">
                                File Preview
                            </DialogTitle>
                            <DialogDescription>
                                {previewFile.file?.name || "Attachment"}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {previewError ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            Cannot preview this file. Please download to view.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="bg-muted/20 flex h-full w-full flex-col items-center justify-center rounded-md p-2">
                        {isSupported ? (
                            <div className="h-[70vh] w-full overflow-auto rounded-md border bg-white">
                                {isPdf ? (
                                    <iframe
                                        src={directUrl || previewFile.url}
                                        className="h-full w-full"
                                        title="PDF Preview"
                                    />
                                ) : (
                                    <FileViewer
                                        fileType={fileType || ""}
                                        filePath={directUrl || previewFile.url}
                                        onError={onError}
                                        errorComponent={
                                            <div className="flex flex-col items-center justify-center p-10 text-center">
                                                <AlertCircle className="text-muted-foreground mb-4 h-16 w-16" />
                                                <h3 className="mb-2 text-lg font-semibold">
                                                    Error previewing file
                                                </h3>
                                                <p className="text-muted-foreground mb-4">
                                                    There was an error loading
                                                    the preview. Please download
                                                    to view.
                                                </p>
                                                <Button
                                                    onClick={handleDownload}
                                                >
                                                    <Download className="mr-2 h-4 w-4" />{" "}
                                                    Download
                                                </Button>
                                            </div>
                                        }
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-10 text-center">
                                <AlertCircle className="text-muted-foreground mb-4 h-16 w-16" />
                                <h3 className="mb-2 text-lg font-semibold">
                                    Cannot preview this file type
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    This file type is not supported for preview.
                                    Please download to view.
                                </p>
                                <Button onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" />{" "}
                                    Download
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={handleDownload}
                        title="Download file"
                    >
                        <Download size={18} className="mr-2" /> Download
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        title="Close"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FilePreviewDialog;
