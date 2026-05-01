import { useState } from "react"
import { Database, Plus } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroupAction
} from "@/components/ui/sidebar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useCollections, useDeleteCollection } from "@/lib/queries"
import CollectionDialog from "@/components/CollectionDialog"

function Dashboard() {
  const [selected, setSelected] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [mode, setMode] = useState("")
  const { data: collections, isLoading, isError, error } = useCollections()
  const deleteCollection = useDeleteCollection()

  const handleDelete = (name) => {
    if (!window.confirm(`Delete collection "${name}"? This cannot be undone.`)) return
    deleteCollection.mutate(name, {
      onSuccess: () => {
        if (selected === name) setSelected(null)
      },
    })
  }

  const handleCollectionAction = (mode) => {
    setMode(mode)
    setCreateOpen(true)
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-3 py-2">
          <div className="flex items-center gap-2">
            <Database className="size-4" />
            <span className="font-medium">ChromaUI</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Collections</SidebarGroupLabel>
            <SidebarGroupAction
              title="Add collection"
              onClick={() => handleCollectionAction("create")}
            >
              <Plus /> <span className="sr-only">Add collection</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuSkeleton />
                    </SidebarMenuItem>
                  ))}
                {isError && (
                  <SidebarMenuItem>
                    <div className="px-2 py-1.5 text-sm text-destructive">
                      {error?.message ?? "Failed to load"}
                    </div>
                  </SidebarMenuItem>
                )}
                {!isLoading && !isError && collections?.length === 0 && (
                  <SidebarMenuItem>
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No collections yet
                    </div>
                  </SidebarMenuItem>
                )}
                {collections?.map((c) => (
                  <SidebarMenuItem key={c.id}>
                    <ContextMenu>
                      <ContextMenuTrigger>
                        <SidebarMenuButton
                          isActive={selected?.name === c.name}
                          onClick={() => setSelected(c)}
                        >
                          <span className="truncate">{c.name}</span>
                        </SidebarMenuButton>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-48">
                        <ContextMenuItem
                          onClick={
                            () => {
                              setSelected(c)
                              handleCollectionAction("edit")
                            }
                          }
                        >
                          Collection Settings
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(c.name)}
                        >
                          Delete Collection
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">
            {selected?.name ?? "Select a collection"}
          </span>
        </header>
        <main className="p-4">
          {selected ? (
            <p className="text-sm text-muted-foreground">
              Items for <span className="font-medium">{selected.name}</span> will go here.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Pick a collection from the sidebar to view its contents.
            </p>
          )}
        </main>
      </SidebarInset>
      <CollectionDialog open={createOpen} onOpenChange={setCreateOpen} mode={mode} initial={selected} />
    </SidebarProvider>
  )
}

export default Dashboard
