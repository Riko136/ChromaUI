import { render, screen, waitFor  } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import userEvent from '@testing-library/user-event'
import Layout from "@/layout";

let item1 = {id: 0, document: "Test doc", embedding: [0,0,0], metadata: {"author": "test"}}

let collections = [{ id: 0, name: "Collection1", items: [item1] }];

const server = setupServer(
    http.get("/api/collections", () => HttpResponse.json(collections)),

    http.get("/api/collections/:name/items", ({params}) => {
        const collection = collections.find((c) => c.name == params.name)
        return HttpResponse.json(collection.items, {status: 200})
    }),

    http.delete("/api/collections/:name/items", ({params}) => {
        const collection = collections.find((c) => c.name == params.name)
        collection.items = []
        return new HttpResponse(null, { status: 204 });   
    }),

    http.patch("/api/collections/:name/:id", async ({request, params}) =>{
        const { document, metadata } = await request.json()
        const collection = collections.find((c) => c.name == params.name)
        const item = collection.items.find((i) => i.id == params.id)
        if(document !== undefined) item.document = document
        if(metadata !== undefined) item.metadata = metadata
        return new HttpResponse(null, {status: 204})
    }),

    http.post("/api/collections/:name/items", async ({request, params}) =>{
        const { ids, documents, metadatas } = await request.json()
        const collection = collections.find((c) => c.name == params.name)
        collection.items.push({id: ids, document: documents, metadata: metadatas})
        return new HttpResponse(null, {status: 201})
    })
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
    await user.click(await screen.findByText("Collection1"))

    // ---- Add item flow ----
    const clickAddItem = async () =>
        await user.click(await screen.findByRole('button', { name: "Add item" }))

    const changeItemIdInput = async (value) =>
        await user.type(await screen.findByRole('textbox', { name: /id/i }), value)

    const changeDocumentInput = async (value) =>
        await user.type(await screen.findByRole('textbox', { name: /document/i }), value)

    const changeMetadataInput = async (value) => {
        await user.clear(await screen.findByRole('textbox', { name: /metadata/i }));
        await user.type(await screen.findByRole('textbox', { name: /metadata/i }), value)
    }

    const clickSubmitItem = async () =>
        await user.click(await screen.findByRole('button', { name: "Add" }))

    // ---- Delete item flow ----
    const selectItem = async () =>
        await user.click(await screen.findByRole('checkbox', { name: "Select row" }))

    const clickDeleteItem = async () =>
        await user.click(await screen.findByRole('button', { name: /Delete/i }))

    // ---- Patch item flow ----
    const selectRow = async () =>
        await user.click(await screen.findByText("Test doc"))
    const clickEditDoc = async () =>
        await user.click(await screen.findByRole('button', {name : /edit/i}))
    const editDocumentInput = async (value) =>
        await user.type(await screen.findByRole('textbox', {name:/document/i}), value)
    const clickSave = async () =>
        await user.click(await screen.findByRole('button', {name: /save/i}))


    return {
        clickAddItem,
        changeItemIdInput,
        changeDocumentInput,
        changeMetadataInput,
        clickSubmitItem,
        selectItem,
        clickDeleteItem,
        selectRow,
        clickEditDoc,
        editDocumentInput,
        clickSave,
    }
}

const setupNewItem = async () => {
    const utils = await setup()
    await utils.clickAddItem()
    // screen.debug(undefined, 300000)
    await utils.changeItemIdInput("1")
    await utils.changeDocumentInput("Test doc2")
    // await utils.changeMetadataInput('{{"new":"true"}')
    await utils.clickSubmitItem()
    // screen.debug(undefined, 300000)

}

const setupDeleteItem = async() =>{
    const utils = await setup()
    await utils.selectItem()
    await utils.clickDeleteItem()
}

const setupEditItem = async() => {
    const utils = await setup()
    await utils.selectRow()
    screen.debug(undefined, 300000)
    await utils.clickEditDoc()
    await utils.editDocumentInput(" edited")
    await utils.clickSave()
}


describe("Items End to End",() => {

    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        queryClient.clear();
        item1 = {id: 0, document: "Test doc", embedding: [0,0,0], metadata: {"author": "test"}}
        collections = [{ id: 0, name: "Collection1", items: [item1] }];
    });
    afterAll(() => server.close());

    it("renders the items successfully", async () =>{
        await setup()
        expect(await screen.findByText("Test doc")).toBeInTheDocument()
    })

    it("adds a new item and renders it successfully", async () => {
        await setupNewItem()
        expect(await screen.findByText("Test doc2")).toBeInTheDocument()
    })

    it("deletes an item and renders it successfully", async () => {
        const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

        await setupDeleteItem()

        expect(confirmSpy).toHaveBeenCalled();
        await waitFor(() => {
            expect(screen.queryByText("Test doc")).not.toBeInTheDocument();
        });
        expect(await screen.findByText("No results.")).toBeInTheDocument();

        confirmSpy.mockRestore(); 
    })



})
