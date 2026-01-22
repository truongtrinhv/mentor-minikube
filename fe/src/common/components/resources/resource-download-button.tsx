import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/common/components/ui/button";
import { resourceServices } from "@/common/services/resourceServices";
import type { Resource } from "@/common/types/resource";

type ResourceDownloadButtonProps = {
    resource: Resource;
};

export const ResourceDownloadButton = ({
    resource,
}: ResourceDownloadButtonProps) => {
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
        <Button
            variant="outline"
            size="icon"
            onClick={handleDownloadFile}
            loading={loading}
            id={`download-resource-${resource.id}`}
        >
            <Download className="size-4" />
        </Button>
    );
};
