import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import SearchInput from "@/common/components/input/search-input";
import DataTable from "@/common/components/table/data-table";
import DataTablePagination from "@/common/components/table/data-table-pagination";
import TableTopBar from "@/common/components/table/data-table-topbar";
import { MultiSelect } from "@/common/components/ui/multi-select";

import { useUsers } from "./hooks/useUsers";
import {
    RoleMap,
    type User,
    type UserQueryParams,
    defaultUserQueryParams,
} from "./types";
import { columns } from "./utils/columns";

const roleOptions = Object.entries(RoleMap).map((entry) => ({
    value: entry[0],
    label: entry[1],
}));

export default function ManageUsersPage() {
    const [query, setQuery] = useState<UserQueryParams>(defaultUserQueryParams);
    const { users, totalUserCount, isLoading } = useUsers(query);

    const columnsWithNumbering: ColumnDef<User>[] = [
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

    const handleRoleChange = (role: string[]) => {
        setQuery((prev) => ({
            ...prev,
            role,
            pageNumber: 1,
        }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        User Management
                    </h1>
                    <p className="text-gray-500">
                        Manage users roles and permissions on the platform
                    </p>
                </div>
            </div>

            <div className="rounded-lg border shadow-sm">
                <div className="p-6">
                    <TableTopBar
                        title="User List"
                        subtitle="Manage all users on the system and change their roles, status"
                    />

                    <div className="mb-4 flex items-center gap-x-4 gap-y-2">
                        <SearchInput
                            onSearch={handleSearchChange}
                            characterLimit={250}
                        />

                        <MultiSelect
                            options={roleOptions}
                            onValueChange={handleRoleChange}
                            placeholder="Select roles"
                            maxCount={3}
                            className="min-h-9 max-w-96"
                        />
                    </div>

                    <DataTable
                        data={users}
                        columns={columnsWithNumbering}
                        loading={isLoading}
                    />

                    <div className="mt-4">
                        <DataTablePagination
                            pageSize={query.pageSize}
                            pageNumber={query.pageNumber}
                            totalRecords={totalUserCount}
                            onPageNumberChanged={handlePageNumberChange}
                            onPageSizeChanged={handlePageSizeChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
