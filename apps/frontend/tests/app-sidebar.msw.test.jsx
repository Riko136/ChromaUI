import AppSidebar from "@/components/app-sidebar";
import { render, screen, waitFor  } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import userEvent from '@testing-library/user-event'
import Layout from "@/layout";

let collections = [{ id: 0, name: "Collection1" }];

const server = setupServer(
  http.get("/api/collections", () => HttpResponse.json(collections)),

  http.post("/api/collections", async ({ request }) => {
    const body = await request.json();
    const newCollection = { id: collections.length, name: body.name, metadata: body.metadata };
    collections = [...collections, newCollection];
    return new HttpResponse(null, { status: 201 });
  }),

  http.delete("/api/collections/:name", ({ params }) => {
    collections = collections.filter((c) => c.name !== params.name);
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch("/api/collections/:name", async ({request, params}) =>{
    const body = await request.json()
    collections.forEach((c) => c.name == params.name ? c.name = body.name : c)
    return new HttpResponse(null, {status: 204})
  }),
  
  http.get("/api/collections/:name/items", () => HttpResponse.json([])),
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
    const clickAddCollection = async () => await user.click(await screen.findByRole('button', { name: "Add collection" }))
    const changeNameInput = async (value) => await user.type(await screen.findByRole('textbox', {name: /name/i}), value)
    const clickSubmit = async () => await user.click(await screen.findByRole('button', { name: /^(save changes|create)$/i }))
    const collection1 = await screen.findByText("Collection1")
    const openContextWindow = async () => await user.pointer({keys: '[MouseRight]', target: collection1})
    const clickDelete = async () => await user.click(await screen.findByText("Delete Collection"))
    const clickSettings = async () => await user.click(await screen.findByText("Collection Settings"))

    return{
        clickAddCollection,
        changeNameInput,
        clickSubmit,
        openContextWindow,
        clickDelete,
        clickSettings,
    }
}

const setupNewCollection = async () => {
    const utils = await setup()
    await utils.clickAddCollection()
    await utils.changeNameInput("Collection2")
    await utils.clickSubmit()
}

const setupDeleteCollection = async () => {
    const utils = await setup()
    await utils.openContextWindow()
    await utils.clickDelete()
}

const setupEditCollection = async () => {
    const utils = await setup()
    await utils.openContextWindow()
    await utils.clickSettings()
    await utils.changeNameInput("-edited")
    await utils.clickSubmit()
}

describe("Collections End to End",() => {

    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        queryClient.clear();
        collections = [{ id: 0, name: "Collection1" }]
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

    it("successfully adds a new collection and renders it", async () =>{
        await setupNewCollection()
        expect(await screen.findByText("Collection2")).toBeInTheDocument()
    })

    it("successfully deletes a collection and renders it", async () => {
        const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

        await setupDeleteCollection()
 
        expect(confirmSpy).toHaveBeenCalled();
        await waitFor(() => {
            expect(screen.queryByText("Collection1")).not.toBeInTheDocument();
        }); 
        
        confirmSpy.mockRestore();
    })

    it("successfully edits a collection and renders it", async () => {
        await setupEditCollection()
        expect(await screen.findByText("Collection1-edited")).toBeInTheDocument()
    })
})
