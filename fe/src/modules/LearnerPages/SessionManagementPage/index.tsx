import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { DateRangePicker } from "@/common/components/input/date-range-picker";
import { FilterCourseCombobox } from "@/common/components/input/filter-course-combobox";
import DataTable from "@/common/components/table/data-table";
import DataTablePagination from "@/common/components/table/data-table-pagination";
import TableTopBar from "@/common/components/table/data-table-topbar";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select";
import type { SessionStatus } from "@/common/types/enums";

import { columnBase } from "./components/columns";
import { useLearnerSessions } from "./hooks/useLearnerSession";
import type { LearnerSessionResponse } from "./types/learner-session-response";
import {
    type SessionQueryParameters,
    defaultSessionQuery,
} from "./types/session-query-parameters";

export default function LearnerSessionManagementPage() {
    const [query, setQuery] =
        useState<SessionQueryParameters>(defaultSessionQuery);
    const { sessions, totalSessionCount, isLoading } =
        useLearnerSessions(query);

    const columns: ColumnDef<LearnerSessionResponse>[] = [
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
        ...columnBase,
    ];

    const handleStatusChange = (value: string) => {
        let sessionStatus = null;
        if (value !== "all") {
            sessionStatus = Number(value) as SessionStatus;
        }
        setQuery({ ...query, sessionStatus });
    };

    const handleCourseChange = (value: string | null) => {
        setQuery({ ...query, courseId: value || null });
    };

    return (
        <div className="rounded-lg border p-4 shadow-sm">
            <TableTopBar
                title="Sessions Management"
                subtitle="Here's a list of sessions belonging to your courses."
            ></TableTopBar>

            <div className="flex space-x-3">
                <Select defaultValue={"all"} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select request status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Status</SelectLabel>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem key={0} value={"0"}>
                                Pending
                            </SelectItem>
                            <SelectItem key={1} value={"1"}>
                                Scheduled
                            </SelectItem>
                            <SelectItem key={2} value={"2"}>
                                Cancelled
                            </SelectItem>
                            <SelectItem key={3} value={"3"}>
                                Rescheduling
                            </SelectItem>
                            <SelectItem key={4} value={"4"}>
                                Completed
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <FilterCourseCombobox
                    setValue={handleCourseChange}
                    value={query.courseId || null}
                />
                <DateRangePicker
                    from={query.from}
                    to={query.to}
                    onApply={(range) =>
                        setQuery({
                            ...query,
                            from: range?.from,
                            to: range?.to,
                        })
                    }
                    className="w-[200px]"
                />
            </div>
            <div className="space-y-4">
                <DataTable
                    data={sessions}
                    columns={columns}
                    loading={isLoading}
                />
                <DataTablePagination
                    pageSize={query?.pageSize}
                    pageNumber={query?.pageNumber}
                    totalRecords={totalSessionCount}
                    onPageNumberChanged={(pageNumber: number) =>
                        setQuery({ ...query, pageNumber: pageNumber })
                    }
                    onPageSizeChanged={(pageSize: number) =>
                        setQuery({
                            ...query,
                            pageNumber: 1,
                            pageSize: pageSize,
                        })
                    }
                />
            </div>
        </div>
    );
}
