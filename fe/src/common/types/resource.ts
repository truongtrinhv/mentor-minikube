import type z from "zod";

import { type QueryParameters, defaultQuery } from "@/common/types/query";

import {
    resourceAddFormSchema,
    resourceEditFormSchema,
} from "../schemas/resource";

export type ResourceAddFormData = z.infer<typeof resourceAddFormSchema>;
export type ResourceEditFormData = z.infer<typeof resourceEditFormSchema>;

export type Resource = {
    id: string;
    title: string;
    description: string;
    filePath: string;
    fileType: string;
};

export type ResourceFileType = "Image" | "Video" | "Document";

export type ResourceQueryParams = QueryParameters & {
    fileType?: ResourceFileType | "";
};

export const defaultResourceQueryParams: ResourceQueryParams = {
    ...defaultQuery,
    fileType: "",
};
