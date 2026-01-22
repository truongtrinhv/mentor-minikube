import { useQuery } from "@tanstack/react-query";

import { QUERY_SESSION_KEY } from "@/common/constants/keys";

import mentoringSessionService from "../services/mentoringSessionService";
import {
    type SessionQueryParameters,
    defaultSessionQuery,
} from "../types/session-query-parameters";

export const useMentorSessions = (
    queryParams: SessionQueryParameters = defaultSessionQuery,
) => {
    const { data, isLoading, error } = useQuery({
        queryKey: [QUERY_SESSION_KEY, queryParams],
        queryFn: () => mentoringSessionService.getAll(queryParams),
    });

    return {
        sessions: data?.data?.items,
        totalSessionCount: data?.data?.totalCount,
        isLoading,
        error,
    };
};
