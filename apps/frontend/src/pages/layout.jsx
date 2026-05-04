import { useMemo, useState } from "react"
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Checkbox } from "@/components/ui/checkbox"
import AppSidebar from "./app-sidebar"
import AppTable from "./app-table"
import TablePagination from "./app-pagination"
import CollectionDialog from "@/components/collection-dialog"
import { useItems } from "@/lib/queries"

const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 10,
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "id", header: "ID", size: 140 },
  { accessorKey: "document", header: "Document", size: 420 },
  {
    accessorKey: "metadata",
    header: "Metadata",
    size: 320,
    cell: ({ getValue }) => {
      const v = getValue()
      return v ? <code className="text-xs">{JSON.stringify(v)}</code> : "—"
    },
  },
]

export default function Layout() {
  const [selected, setSelected] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [mode, setMode] = useState("")
  const [rowSelection, setRowSelection] = useState({})

  const { data, isLoading, isError, error } = useItems(selected?.name)

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
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    defaultColumn: {
      minSize: 10,
      size: 240,
      maxSize: 500,
    },
  })

  return (
    <SidebarProvider>
      <AppSidebar
        setCreateOpen={setCreateOpen}
        setMode={setMode}
        selected={selected}
        setSelected={setSelected}
      />
      <SidebarInset className="flex flex-col min-h-svh">
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">
            {selected?.name ?? "Select a collection"}
          </span>
        </header>
        <main className="flex-1">
          {selected ? (
            <AppTable
              table={table}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          ) : (
            <p className="text-sm text-muted-foreground p-4">
              Pick a collection from the sidebar to view its contents.
            </p>
          )}
        </main>
        <footer className="flex h-12 items-center justify-end gap-2 border-t px-4">
          {selected && <TablePagination table={table} />}
        </footer>
      </SidebarInset>
      <CollectionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode={mode}
        initial={selected}
      />
    </SidebarProvider>
  )
}
