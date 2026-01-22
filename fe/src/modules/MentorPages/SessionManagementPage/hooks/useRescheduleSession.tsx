import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_SESSION_KEY } from "@/common/constants/keys";
import { MENTORING_SESSION_MESSAGES } from "@/common/constants/validation-messages/mentoring-session";

import mentoringSessionService from "../services/mentoringSessionService";
import type { RescheduleSessionRequest } from "../types/update-session-request";

export const useRescheduleSession = (sessionId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (body: RescheduleSessionRequest) =>
            mentoringSessionService.reschedule(sessionId, body),
        onSuccess: () => {
            toast.success(MENTORING_SESSION_MESSAGES.RESCHEDULE_SUCCESS);
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey.includes(QUERY_SESSION_KEY),
            });
        },
        onError: () => {
            toast.error(MENTORING_SESSION_MESSAGES.RESCHEDULE_FAILED);
        },
    });

    return {
        reschedule: mutateAsync,
        isPending,
    };
};
