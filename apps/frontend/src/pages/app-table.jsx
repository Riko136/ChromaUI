import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useMemo } from "react"
import { useItems } from "@/lib/queries"


export default function AppTable({collection}) {
    const { data, isLoading, isError, error } = useItems(collection.name)

    const columns =
    [{ accessorKey: 'id', header: 'ID', size: 140 },
    {
        accessorKey: 'document',
        header: 'Document',
        size: 420,
    },
    {
        accessorKey: "metadata",
        header: "Metadata",
        size: 320,
        cell: ({ getValue }) => {
            const v = getValue()
            return v ? <code className="text-xs">{JSON.stringify(v)}</code> : "—"
        },
    },]

    const rows = useMemo(() => {
        if (!data?.ids) return []
        return data.ids.map((id, i) => ({
        id,
        document: data.documents?.[i] ?? "",
        metadata: data.metadatas?.[i] ?? null,
        }))
    }, [data])

    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })


    return (
        <div className="overflow-hidden">
        <Table className="table-fixed w-full">
            <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                    return (
                    <TableHead
                    key={header.id}
                    style={{ width: header.column.getSize() }}
                    >
                        {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                            )}
                    </TableHead>
                    )
                })}
                </TableRow>
            ))}
            </TableHeader>
            <TableBody>
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                >
                    {row.getVisibleCells().map((cell) => (
                    <TableCell
                    key={cell.id}
                    className="truncate"
                    title={typeof cell.getValue() === "object" ? JSON.stringify(cell.getValue()) : String(cell.getValue() ?? "")}
                    >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
    )
}