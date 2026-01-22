import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import SearchInput from "@/common/components/input/search-input";
import DataTable from "@/common/components/table/data-table";
import DataTablePagination from "@/common/components/table/data-table-pagination";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select";
import { useResources } from "@/common/hooks/use-resources";
import {
    type Resource,
    type ResourceFileType,
    type ResourceQueryParams,
    defaultResourceQueryParams,
} from "@/common/types/resource";

import { columns } from "./utils/columns";

export function LearnerResourcesPage() {
    const [query, setQuery] = useState<ResourceQueryParams>(
        defaultResourceQueryParams,
    );
    const { resources, totalCount, isPending } = useResources(query);

    const handlePageNumberChange = (pageNumber: number) => {
        setQuery((prev) => ({
            ...prev,
            pageNumber,
        }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setQuery((prev) => ({
            ...prev,
            pageSize,
            pageNumber: 1,
        }));
    };

    const handleSearchChange = (search: string) => {
        setQuery((prev) => ({
            ...prev,
            search,
            pageNumber: 1,
        }));
    };

    const handleFileTypeChange = (fileType: ResourceFileType | "clear") => {
        setQuery((prev) => ({
            ...prev,
            fileType: fileType === "clear" ? "" : fileType,
            pageNumber: 1,
        }));
    };

    const columnsWithNumbering: ColumnDef<Resource>[] = [
        {
            id: "index",
            header: "No.",
            cell: ({ row }) => (
                <div>
                    {(query.pageNumber - 1) * query.pageSize + row.index + 1}
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        ...columns,
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        My Course Resources
                    </h1>
                    <p className="text-gray-500">
                        Download resources from the courses you have taken.
                    </p>
                </div>
            </div>

            <div className="rounded-lg border shadow-sm">
                <div className="p-6">
                    <div className="mb-4 flex items-center gap-x-4">
                        <div className="flex flex-grow flex-wrap gap-x-4 gap-y-2">
                            <SearchInput
                                onSearch={handleSearchChange}
                                characterLimit={250}
                            />

                            <Select
                                value={query.fileType}
                                onValueChange={handleFileTypeChange}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem
                                            value="clear"
                                            className="font-medium italic"
                                        >
                                            Clear
                                        </SelectItem>
                                        <SelectItem value="Image">
                                            Image
                                        </SelectItem>
                                        <SelectItem value="Video">
                                            Video
                                        </SelectItem>
                                        <SelectItem value="Document">
                                            Document
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DataTable
                        data={resources}
                        columns={columnsWithNumbering}
                        loading={isPending}
                    />

                    <div className="mt-4">
                        <DataTablePagination
                            pageSize={query.pageSize}
                            pageNumber={query.pageNumber}
                            totalRecords={totalCount}
                            onPageNumberChanged={handlePageNumberChange}
                            onPageSizeChanged={handlePageSizeChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
