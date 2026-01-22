import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userServices } from "../services/userServices";

export const useActivateDeactivate = (userId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync: activate, isPending: activatePending } = useMutation({
        mutationFn: () => userServices.activate(userId),
        onSuccess: () => {
            toast.success("Activated user.");
            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey.includes("users"),
            });
        },
        onError: () => {
            toast.error(
                "An error happened when activating user. Please try again.",
            );
        },
    });

    const { mutateAsync: deactivate, isPending: deactivatePending } =
        useMutation({
            mutationFn: () => userServices.deactivate(userId),
            onSuccess: () => {
                toast.success("Deactivated user.");
                queryClient.invalidateQueries({
                    predicate: (query) => query.queryKey.includes("users"),
                });
            },
            onError: () => {
                toast.error(
                    "An error happened when deactivating user. Please try again.",
                );
            },
        });

    return {
        activate,
        deactivate,
        isPending: activatePending || deactivatePending,
    };
};
