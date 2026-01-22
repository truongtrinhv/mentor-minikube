export type PaginatedResponseModel<T> = {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
};

export type ListResponseModel<T> = {
    items: T[];
};
