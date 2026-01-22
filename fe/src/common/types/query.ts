export type QueryParameters = {
    pageSize: number;
    pageNumber: number;
    search: string;
};

export const defaultQuery: QueryParameters = {
    pageSize: 10,
    pageNumber: 1,
    search: "",
};
