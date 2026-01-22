import { useQuery } from "@tanstack/react-query";

import { resourceServices } from "@/common/services/resourceServices";
import {
    type ResourceQueryParams,
    defaultResourceQueryParams,
} from "@/common/types/resource";

export const useResources = (
    queryParams: ResourceQueryParams = defaultResourceQueryParams,
) => {
    const { data, isPending, isError } = useQuery({
        queryKey: ["resources", queryParams],
        queryFn: () => resourceServices.getAll(queryParams),
    });

    return {
        resources: data?.data?.items,
        totalCount: data?.data?.totalCount,
        isPending,
        isError,
    };
};
