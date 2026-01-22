import { useQuery } from "@tanstack/react-query";

import { userServices } from "../services/userServices";
import { type UserQueryParams, defaultUserQueryParams } from "../types";

export const useUsers = (
    queryParams: UserQueryParams = defaultUserQueryParams,
) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["users", queryParams],
        queryFn: () =>
            userServices.get(
                queryParams.pageNumber,
                queryParams.pageSize,
                queryParams.search,
                queryParams.role,
            ),
    });

    return {
        users: data?.data?.items,
        totalUserCount: data?.data?.totalCount,
        isLoading,
        error,
    };
};
