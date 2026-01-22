import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_SESSION_KEY } from "@/common/constants/keys";
import { MENTORING_SESSION_MESSAGES } from "@/common/constants/validation-messages/mentoring-session";

import learnerSessionService from "../services/learnerSessionService";

export const useApproveSession = (sessionId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync: approve, isPending: approvePending } = useMutation({
        mutationFn: () => learnerSessionService.approve(sessionId),
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

    const { mutateAsync: reject, isPending: rejectPending } = useMutation({
        mutationFn: () => learnerSessionService.reject(sessionId),
        onSuccess: () => {
            toast.success(MENTORING_SESSION_MESSAGES.REJECT_SUCCESS);
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey.includes(QUERY_SESSION_KEY),
            });
        },
        onError: () => {
            toast.error(MENTORING_SESSION_MESSAGES.REJECT_FAILED);
        },
    });

    return {
        approve,
        reject,
        isPending: approvePending || rejectPending,
    };
};
