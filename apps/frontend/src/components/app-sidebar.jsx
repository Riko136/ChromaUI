import { Database, Plus } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
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


function AppSidebar({ setCreateOpen, setMode, selected, setSelected }) {
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

      
      
      
    
  )
}

export default AppSidebar
