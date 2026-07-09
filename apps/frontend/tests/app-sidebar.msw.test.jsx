import AppSidebar from "@/components/app-sidebar";
import { findByText, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import userEvent from '@testing-library/user-event'
import { useState } from "react"
import Layout from "@/layout";

// const [selected, setSelected] = useState(null)
// const [createOpen, setCreateOpen] = useState(false)
// const [mode, setMode] = useState("")

const server = setupServer(
  http.get("/api/collections", () =>
    HttpResponse.json([{ id: 0, name: "Collection1" }])
  ),

  http.post("/api/collections", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 1, name: body.name, metadata: body.metadata }, { status: 201 });
  }),

  http.delete("/api/collections/:name", () => HttpResponse(null, { status: 204 })),
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const setup = async () => {
    render(
        <QueryClientProvider client={queryClient}>
            <Layout/>
        </QueryClientProvider>
    );
    const user = userEvent.setup()
    const collection1 = await screen.findByText("Collection1")
    const clickAddCollection = async () => await user.click(screen.getByRole('button', { name:"Add collection" }))
    const changeNameInput = async (value) => await user.type(await screen.findByText("Name"), value)
    // const clickSubmit = async () => await user.click(screen.getByRole('button', { name: /^(save changes|create)$/i }))
    const clickSubmit = async () => await user.click(await screen.findByText("Create"))

    const openContextWindow = async () => await user.pointer({keys: '[MouseRight]', target: collection1})
    const clickDelete = async () => await user.click(screen.getByText("Delete Collection"))
    const clickSettings = async () => await user.click(screen.getByText("Collection Settings"))

    return{
        collection1,
        clickAddCollection,
        changeNameInput,
        clickSubmit,
        openContextWindow,
        clickDelete,
        clickSettings
    }
}

describe("Collections End to End",() => {

    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        queryClient.clear();
    });
    afterAll(() => server.close());

    it("Successfully fetches the collections and renders them", async () => {
        render(
            <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Collection1")).toBeInTheDocument();
    });

    // it("successfully adds a collection and renders it", async () =>{
    //     const utils = await setup()
    //     utils.clickAddCollection()
    //     utils.changeNameInput("Collection2")
    //     utils.clickSubmit()
    //     // expect(await screen.findByText("Collection2")).toBeInTheDocument()
    //     expect(screen.getAllByRole('listitem', {Name: ""})).toHaveLength(2)
    // })
})
