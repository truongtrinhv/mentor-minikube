import type {
    ColumnDef,
    RowSelectionState,
    VisibilityState,
} from "@tanstack/react-table";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data?: TData[] | null;
    children?: React.ReactNode;
    displayBorder?: boolean;
    loading?: boolean;
    onDataSelected?: (data: TData[]) => void;
};

const emptyData: any[] = [];

export default function DataTable<TData, TValue>(
    props: DataTableProps<TData, TValue>,
) {
    const {
        columns,
        data = null,
        children,
        displayBorder = false,
        loading = false,
        onDataSelected = () => {},
    } = props;
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {},
    );
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const table = useReactTable({
        data: data ?? emptyData,
        columns,
        state: {
            columnVisibility,
            rowSelection,
        },
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
    });

    useEffect(() => {
        if (onDataSelected) {
            const selected = table
                .getSelectedRowModel()
                .rows.map(({ original }) => original);
            onDataSelected(selected);
        }
    }, [onDataSelected, rowSelection, table]);

    return (
        <>
            <div>{children}</div>
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader className="bg-secondary/80">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            className={`${displayBorder && "border-r"}`}
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {!loading && table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            className={`${displayBorder && "border-r"}`}
                                            key={cell.id}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="lds-ring me-2 h-[25px] w-[25px]">
                                                <div className="h-[25px] w-[25px] border-[4px]"></div>
                                                <div className="h-[25px] w-[25px] border-[4px]"></div>
                                                <div className="h-[25px] w-[25px] border-[4px]"></div>
                                                <div className="h-[25px] w-[25px] border-[4px]"></div>
                                            </div>
                                            <div>Loading data...</div>
                                        </div>
                                    ) : (
                                        "No results"
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
