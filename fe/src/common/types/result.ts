/* eslint-disable @typescript-eslint/no-explicit-any */
export type Result<T = any> = {
    isSuccess: boolean;
    statusCode: number;
    errors?: Error[];
    data?: T;
};

export type PaginationResult<T> = {
    pageSize: number;
    pageIndex: number;
    totalCount: number;
    items: T[];
};

export type Error = {
    code: string;
    message: string;
};
