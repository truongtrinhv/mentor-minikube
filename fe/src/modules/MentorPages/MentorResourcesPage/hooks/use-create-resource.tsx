import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { RESOURCE_MESSAGES } from "@/common/constants/validation-messages/resource";
import { resourceServices } from "@/common/services/resourceServices";
import type { ResourceAddFormData } from "@/common/types/resource";

export const useCreateResource = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (data: ResourceAddFormData) =>
            resourceServices.create(data),
        onSuccess: () => {
            toast.success(RESOURCE_MESSAGES.CREATED_SUCCESSFULLY);

            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey.includes("resources"),
            });
        },
    });

    return {
        create: mutateAsync,
        isPending,
    };
};
