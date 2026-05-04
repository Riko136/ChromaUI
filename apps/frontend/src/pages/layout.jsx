import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import AppSidebar from "./app-sidebar"
import { useState } from "react"
import CollectionDialog from "@/components/collection-dialog"
import AppTable  from "./app-table"


export default function Layout() {
    const [selected, setSelected] = useState(null)
    const [createOpen, setCreateOpen] = useState(false)
    const [mode, setMode] = useState("")

    return (
        <SidebarProvider>
        <AppSidebar 
        setCreateOpen={setCreateOpen} setMode={setMode} 
        selected={selected} setSelected={setSelected} 
        />
        <SidebarInset>
            <header className="flex h-12 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <span className="text-sm font-medium">
                {selected?.name ?? "Select a collection"}
            </span>
            </header>
            <main >
            {selected ? (
                <AppTable collection={selected}/>
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