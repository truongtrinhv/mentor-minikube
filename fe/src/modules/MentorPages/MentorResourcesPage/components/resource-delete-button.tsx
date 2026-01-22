import { Trash } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/common/components/dialog/confirm-dialog";
import { Button } from "@/common/components/ui/button";
import type { Resource } from "@/common/types/resource";

import { useDeleteResource } from "../hooks/use-delete-resource";

type ResourceDeleteButtonProps = {
    resource: Resource;
};

export const ResourceDeleteButton = ({
    resource,
}: ResourceDeleteButtonProps) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { deleteResource, isPending } = useDeleteResource(resource.id);

    return (
        <>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDeleteDialogOpen(true)}
                id={`delete-resource-${resource.id}`}
            >
                <Trash className="text-destructive size-4" />
            </Button>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title={`Confirm delete ${resource.title}`}
                desc="Are you sure you want to delete this resource? This action cannot be undone."
                handleConfirm={() => {
                    deleteResource();
                    setIsDeleteDialogOpen(false);
                }}
                destructive={true}
                isLoading={isPending}
            />
        </>
    );
};
