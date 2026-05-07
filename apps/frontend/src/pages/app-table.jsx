import { flexRender } from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export default function AppTable({ table, isLoading, isError, error, onRowClick }) {
  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading…</p>
  }
  if (isError) {
    return <p className="p-4 text-sm text-destructive">{error?.message ?? "Failed to load"}</p>
  }

  const columnCount = table.getAllLeafColumns().length

  return (

      <Table className="w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const { size } = header.column.columnDef
                const id = header.column.id
                const rendered = header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())
                const content = id === "select"
                  ? <div className="flex items-center justify-center">{rendered}</div>
                  : rendered
                return (
                  <TableHead
                    key={header.id}
                    style={{ width: size }}
                    className={cn("whitespace-normal", header.column.columnDef.meta?.className)}
                  >
                    {content}
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
                onClick={() => onRowClick?.(row.original)}
                className={"cursor-pointer"}
              >
                {row.getVisibleCells().map((cell) => {
                  const { size } = cell.column.columnDef
                  const id = cell.column.id
                  const rendered = flexRender(cell.column.columnDef.cell, cell.getContext())
                  let content
                  if (id === "select") {
                    content = <div className="flex items-center justify-center py-2">{rendered}</div>
                  } else if (id === "document" || id === "metadata") {
                    content = (
                      <div className="max-w-4xl py-1.5">
                        <div className="truncate">{rendered}</div>
                      </div>
                    )
                  } else if (id === "id") {
                    content = <div className="pt-1.5 line-clamp-1 min-w-14">{rendered}</div>
                  } else {
                    content = <div className="pt-1.5 line-clamp-1">{rendered}</div>
                  }
                  return (
                    <TableCell
                      key={cell.id}
                      style={{ width: size }}
                      className="align-top py-0 whitespace-normal"
                      onClick={id === "select" ? (e) => e.stopPropagation() : undefined}
                    >
                      {content}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
  )
}
