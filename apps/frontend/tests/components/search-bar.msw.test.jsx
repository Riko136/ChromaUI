import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import Layout from "@/layout";

let item1 = { id: 0, document: "Test doc", embedding: [0, 0, 0], metadata: { author: "test" } };
let collections = [{ id: 0, name: "Collection1", items: [item1] }];


const textSearchResults = [
    { id: 1, document: "Found via text search", metadata: null },
];

const semanticSearchResults = [
    { id: 2, document: "Found via semantic search", metadata: null, distance: 0.1234 },
];

const regexSearchResults = [
    { id: 3, document: "Found via regex search", metadata: null },
];

const server = setupServer(
    http.get("/api/collections", () => HttpResponse.json(collections)),

    http.get("/api/collections/:name/items", ({ params }) => {
        const collection = collections.find((c) => c.name === params.name);
        return HttpResponse.json(collection.items, { status: 200 });
    }),

    http.post("/api/collections/:name/text", async ({ params }) => {
        return HttpResponse.json(textSearchResults, { status: 200 });
    }),

    http.post("/api/collections/:name/semantic", async ({ params }) => {
        return HttpResponse.json(semanticSearchResults, { status: 200 });
    }),

    http.post("/api/collections/:name/regex", async ({ params }) => {
        return HttpResponse.json(regexSearchResults, { status: 200 });
    }),
);

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
});

const setup = async () => {
    render(
        <QueryClientProvider client={queryClient}>
            <Layout />
        </QueryClientProvider>
    );
    const user = userEvent.setup();
    await user.click(await screen.findByText("Collection1"));
    await screen.findByText("Test doc"); // wait for initial items list to load

    const typeSearch = async (value) =>
        await user.type(await screen.findByPlaceholderText("Search documents..."), value);

    const clearSearch = async () =>
        await user.click(await screen.findByRole("button", { name: /clear search/i }));

    const clickModeToggle = async (mode) =>
        await user.click(await screen.findByRole("button", { name: mode }));
    return {
        user,
        typeSearch,
        clearSearch,
        clickModeToggle,
    };
};

const setupWithInput = async () =>{
    const utils = await setup()
    await utils.typeSearch("found");
    return utils
}

const setupWithInputSemantic = async () =>{
    const utils = await setup();
    await utils.clickModeToggle("Semantic");
    await utils.typeSearch("found");
    return utils
}

const setupWithInputRegex = async () =>{
    const utils = await setup();
    await utils.clickModeToggle("Regex");
    await utils.typeSearch("^found");
    return utils
}

describe("Search End to End", () => {
    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        queryClient.clear();
        item1 = { id: 0, document: "Test doc", embedding: [0, 0, 0], metadata: { author: "test" } };
        collections = [{ id: 0, name: "Collection1", items: [item1] }];
    });
    afterAll(() => server.close());

    it("shows text search results after typing", async () => {
        await setupWithInput()

        expect(await screen.findByText("Found via text search")).toBeInTheDocument();
        expect(screen.queryByText("Test doc")).not.toBeInTheDocument();
    });

    it("reverts to the items list when search input is cleared", async () => {
        const utils = await setupWithInput()
        await screen.findByText("Found via text search");
        await utils.clearSearch();

        expect(await screen.findByText("Test doc")).toBeInTheDocument();
        expect(screen.queryByText("Found via text search")).not.toBeInTheDocument();
    });

    it("shows semantic search results and a Distance column when semantic mode is selected", async () => {
        await setupWithInputSemantic()

        expect(await screen.findByText("Found via semantic search")).toBeInTheDocument();
        expect(screen.getByText("Distance")).toBeInTheDocument();
        expect(screen.getByText("0.1234")).toBeInTheDocument(); 
    });

    it("does not show a Distance column in text mode", async () => {
        await setupWithInput()
        await screen.findByText("Found via text search");
        expect(screen.queryByText("Distance")).not.toBeInTheDocument();
    });

    it("shows regex search results when regex mode is selected", async () => {
        await setupWithInputRegex()
        expect(await screen.findByText("Found via regex search")).toBeInTheDocument();
    });
}); 