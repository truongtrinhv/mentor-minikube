import { ResourceDownloadButton } from "@/common/components/resources/resource-download-button";
import type { Resource } from "@/common/types/resource";

type LearnerResourceActionButtonsProps = {
    resource: Resource;
};

export const LearnerResourceActionButtons = ({
    resource,
}: LearnerResourceActionButtonsProps) => {
    return (
        <div className="flex gap-3">
            <ResourceDownloadButton resource={resource} />
        </div>
    );
};
