import { useMemo, useState } from "react"
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Trash2, FilePlusCorner  } from "lucide-react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import AppSidebar from "./app-sidebar"
import AppTable from "./app-table"
import ItemDialog from "./item-dialog"
import TablePagination from "./app-pagination"
import CollectionDialog from "@/pages/collection-dialog"
import { useDeleteItems, useItems } from "@/lib/queries"
import ItemDetailPanel from "./item-detail-panel"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

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
    size: "32px",
    // minSize: 20,
    // maxSize: 24,
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: "id", header: "ID", size: "auto" },
  { accessorKey: "document", header: "Document", size: "900px"},
  {
    accessorKey: "metadata",
    header: "Metadata",
    size: "auto",
    cell: ({ getValue }) => {
      const v = getValue()
      return v ? <code className="text-xs">{JSON.stringify(v)}</code> : "—"
    },
  },
]

export default function Layout() {
  const [selected, setSelected] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createItemOpen, setCreateItemOpen] = useState(false)
  const [mode, setMode] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [openItemId, setOpenItemId] = useState(null)

  const { data, isLoading, isError, error } = useItems(selected?.name)
  const deleteItems = useDeleteItems(selected?.name)

  const rows = useMemo(() => {
    if (!data?.ids) return []
    return data.ids.map((id, i) => ({
      id,
      document: data.documents?.[i] ?? "",
      metadata: data.metadatas?.[i] ?? null,
      embedding: data.embeddings?.[i] ?? [],
    }))
  }, [data])

  const openItem = openItemId ? rows.find((r) => r.id === openItemId) ?? null : null

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    // defaultColumn: {
    //   minSize: 10,
    //   size: 500,
    //   maxSize: 2000,
    // },
  })


  const selectedIds = Object.keys(rowSelection)
  const handleDelete = () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Delete ${selectedIds.length} item(s)? This cannot be undone.`)) return
    deleteItems.mutate(selectedIds, {
      onSuccess: () => setRowSelection({}),
    })
  }

  return (
    <SidebarProvider>
      <AppSidebar
        setCreateOpen={setCreateOpen}
        setMode={setMode}
        selected={selected}
        setSelected={setSelected}
      />
      <SidebarInset className="flex flex-col min-h-svh min-w-0">
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">
            {selected?.name ?? "Select a collection"}
          </span>
        </header>
        <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0" autoSaveId="record-detail-layout">
          <ResizablePanel minSize={"50%"}>
            <main className="h-full min-w-0 overflow-x-auto [&_[data-slot=table-container]]:overflow-x-visible">
              {selected ? (
                <AppTable
                  table={table}
                  isLoading={isLoading}
                  isError={isError}
                  error={error}
                  onRowClick={(row) => setOpenItemId(row.id)}
                />
              ) : (
                <p className="text-sm text-muted-foreground p-4">
                  Pick a collection from the sidebar to view its contents.
                </p>
              )}
            </main>
          </ResizablePanel>
          {openItem && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel minSize={"20%"}>
                <ItemDetailPanel
                  item={openItem}
                  collectionName={selected?.name}
                  onClose={() => setOpenItemId(null)}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
        <footer className="flex h-12 items-center justify-between gap-2 border-t px-4">
          <div className="flex items-center gap-2">
            {selected && selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="bg-transparent"
                onClick={handleDelete}
                disabled={deleteItems.isPending}
              >
                <Trash2 className="size-4" />
                Delete {selectedIds.length} item{selectedIds.length !== 1 && "s"}
              </Button>
            )}
            {selected && 
              <Button variant="ghost" 
                onClick={() => setCreateItemOpen(true)}
                size="sm"
                disabled={createItemOpen}  
              >
                <FilePlusCorner  className="size-4"/> 
                <span className="sr-only">Add collection</span>
              </Button>
            }
          </div>
          <div className="flex items-center gap-2">
            {selected && <TablePagination table={table} />}
          </div>
        </footer>
      </SidebarInset>
      <CollectionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode={mode}
        initial={selected}
      />
      <ItemDialog
        open={createItemOpen}
        onOpenChange={setCreateItemOpen}
        collection={selected}
      />

    </SidebarProvider>
  )
}
