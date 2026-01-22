import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { RESOURCE_MESSAGES } from "@/common/constants/validation-messages/resource";
import { resourceServices } from "@/common/services/resourceServices";

export const useDeleteResource = (resourceId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: () => resourceServices.delete(resourceId),
        onSuccess: () => {
            toast.success(RESOURCE_MESSAGES.DELETED_SUCCESSFULLY);

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey.includes("resources"),
            });
        },
    });

    return {
        deleteResource: mutateAsync,
        isPending,
    };
};
