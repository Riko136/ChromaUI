import { useState } from "react"
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Trash2, FilePlusCorner  } from "lucide-react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import AppSidebar from "./components/app-sidebar"
import AppTable from "./components/app-table"
import ItemDialog from "./components/item-dialog"
import TablePagination from "./components/app-pagination"
import CollectionDialog from "./components/collection-dialog"
import { useDeleteItems, useItems, useSearch } from "@/lib/queries"
import ItemDetailPanel from "./components/item-detail-panel"
import SearchBar from "./components/search-bar"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useItemColumns } from "./hooks/use-item-columns"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Layout() {
  const [selected, setSelected] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createItemOpen, setCreateItemOpen] = useState(false)
  const [mode, setMode] = useState("")
  const [openItemId, setOpenItemId] = useState(null)
  const [searchInput, setSearchInput] = useState("");
  const [searchMode, setSearchMode] = useState(["text"]);
  const debouncedInput = useDebouncedValue(searchInput, 300)

  const itemsQuery  = useItems(selected?.name)
  const searchQuery = useSearch(selected?.name, debouncedInput, searchMode)
  const active = debouncedInput ? searchQuery : itemsQuery
  const { data: rows = [], isLoading, isError, error } = active
  const deleteItems = useDeleteItems(selected?.name)
  const columns = useItemColumns(debouncedInput, searchMode)

  const openItem = openItemId ? rows.find((r) => r.id === openItemId) ?? null : null

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })



  const selectedIds = Object.keys(table.getState().rowSelection)
  const handleDelete = () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Delete ${selectedIds.length} item(s)? This cannot be undone.`)) return
    deleteItems.mutate(selectedIds, {
      onSuccess: () => table.setRowSelection({}),
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
      <SidebarInset className="flex flex-col h-svh min-w-0">
        <header className="flex h-14 items-center gap-2 px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">
            {selected?.name ?? "Select a collection"}
          </span>
        </header>
        <div className="flex min-h-10 items-center gap-2 border-b px-4">
          <SearchBar 
            name={selected?.name}
            mode={searchMode}
            setMode={setSearchMode}
            input={searchInput}
            setInput={setSearchInput}
            disabled={!selected}
          />
        </div>
        <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
          <ResizablePanel minSize={"50%"}>
            <main className="h-full min-w-0 overflow-x-auto [&_[data-slot=table-container]]:overflow-x-visible">
              {selected ? (
                <AppTable
                  table={table}
                  isLoading={isLoading}
                  isError={isError}
                  error={error}
                  onRowClick={(row) => setOpenItemId(row.id)}
                  openItemId={openItemId}
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
