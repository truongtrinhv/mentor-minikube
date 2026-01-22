import { ResourceDownloadButton } from "@/common/components/resources/resource-download-button";
import type { Resource } from "@/common/types/resource";

import { ResourceDeleteButton } from "./resource-delete-button";
import { ResourceEditButton } from "./resource-edit-form";

type MentorResourceActionButtonsProps = {
    resource: Resource;
};

export const MentorResourceActionButtons = ({
    resource,
}: MentorResourceActionButtonsProps) => {
    return (
        <div className="flex gap-3">
            <ResourceDownloadButton resource={resource} />
            <ResourceEditButton resource={resource} />
            <ResourceDeleteButton resource={resource} />
        </div>
    );
};
