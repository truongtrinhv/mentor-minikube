import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { RESOURCE_MESSAGES } from "@/common/constants/validation-messages/resource";
import { resourceServices } from "@/common/services/resourceServices";
import type { ResourceEditFormData } from "@/common/types/resource";

type EditMutationParams = {
    resourceId: string;
    data: ResourceEditFormData;
};

export const useEditResource = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({ resourceId, data }: EditMutationParams) =>
            resourceServices.update(resourceId, data),
        onSuccess: () => {
            toast.success(RESOURCE_MESSAGES.UPDATED_SUCCESSFULLY);

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey.includes("resources"),
            });
        },
    });

    return {
        edit: mutateAsync,
        isPending,
    };
};
