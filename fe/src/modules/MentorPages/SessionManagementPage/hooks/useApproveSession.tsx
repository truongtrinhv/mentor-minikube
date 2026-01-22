import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_SESSION_KEY } from "@/common/constants/keys";
import { MENTORING_SESSION_MESSAGES } from "@/common/constants/validation-messages/mentoring-session";

import mentoringSessionService from "../services/mentoringSessionService";

export const useApproveSession = (sessionId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: () => mentoringSessionService.approve(sessionId),
        onSuccess: () => {
            toast.success(MENTORING_SESSION_MESSAGES.APPROVE_SUCCESS);
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey.includes(QUERY_SESSION_KEY),
            });
        },
        onError: () => {
            toast.error(MENTORING_SESSION_MESSAGES.APPROVE_FAILED);
        },
    });

    return {
        approve: mutateAsync,
        isPending,
    };
};
