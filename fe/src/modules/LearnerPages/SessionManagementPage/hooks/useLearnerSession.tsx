import { useQuery } from "@tanstack/react-query";

import { QUERY_SESSION_KEY } from "@/common/constants/keys";

import learnerSessionService from "../services/learnerSessionService";
import {
    type SessionQueryParameters,
    defaultSessionQuery,
} from "../types/session-query-parameters";

export const useLearnerSessions = (
    queryParams: SessionQueryParameters = defaultSessionQuery,
) => {
    const { data, isLoading, error } = useQuery({
        queryKey: [QUERY_SESSION_KEY, queryParams],
        queryFn: () => learnerSessionService.getAll(queryParams),
    });

    return {
        sessions: data?.data?.items,
        // sessions: mentoringSessions,
        totalSessionCount: data?.data?.totalCount,
        isLoading,
        error,
    };
};
