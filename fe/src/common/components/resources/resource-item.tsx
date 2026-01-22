import { Download, FileImage, FileText, FileVideo } from "lucide-react";
import { useState } from "react";

import { cn } from "@/common/lib/utils";
import { resourceServices } from "@/common/services/resourceServices";
import type { Resource } from "@/common/types/resource";

import { Button } from "../ui/button";

export const getFileIcon = (fileType: string) => {
    switch (fileType) {
        case "Video":
            return (
                <FileVideo className="text-muted-foreground size-8 flex-shrink-0" />
            );
        case "Image":
            return (
                <FileImage className="text-muted-foreground size-8 flex-shrink-0" />
            );
        case "Document":
        default:
            return (
                <FileText className="text-muted-foreground size-8 flex-shrink-0" />
            );
    }
};

type ResourceItemProps = {
    resource: Resource;
    enableDownload?: boolean;
    className?: string;
};

export const ResourceItem = ({
    resource,
    enableDownload = false,
    className,
}: ResourceItemProps) => {
    const [loading, setLoading] = useState(false);
    const handleDownloadFile = () => {
        setLoading(true);
        resourceServices
            .getPreSignedUrl(resource.id)
            .then((response) => {
                const downloadUrl = response.data;
                window.open(downloadUrl, "_blank", "noopener,noreferrer");
            })
            .finally(() => {
                setLoading(false);
            });
    };
    return (
        <div className={cn("flex items-center gap-4", className)}>
            {getFileIcon(resource.fileType)}

            <div className="min-w-0">
                <p className="flex items-center gap-2">
                    <span className="truncate font-bold">{resource.title}</span>

                    {enableDownload && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDownloadFile}
                            loading={loading}
                            id={`download-resource-${resource.id}`}
                        >
                            <Download className="hover:text-primary/75 size-4" />
                        </Button>
                    )}
                </p>

                <p className="text-primary/75 truncate text-sm">
                    {resource.description}
                </p>
            </div>
        </div>
    );
};
