import { useState } from "react"
import { Database } from "lucide-react"
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
} from "@/components/ui/sidebar"
import { useCollections } from "@/lib/queries"

function Dashboard() {
  const [selected, setSelected] = useState(null)
  const { data: collections, isLoading, isError, error } = useCollections()

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
                    <SidebarMenuButton
                      isActive={selected === c.name}
                      onClick={() => setSelected(c.name)}
                    >
                      <span className="truncate">{c.name}</span>
                    </SidebarMenuButton>
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
            {selected ?? "Select a collection"}
          </span>
        </header>
        <main className="p-4">
          {selected ? (
            <p className="text-sm text-muted-foreground">
              Items for <span className="font-medium">{selected}</span> will go here.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Pick a collection from the sidebar to view its contents.
            </p>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Dashboard
