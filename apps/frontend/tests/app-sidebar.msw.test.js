import AppSidebar from "@/components/app-sidebar";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";


const server = setupServer(
  http.get("/api/collections", () =>
    HttpResponse.json([{ id: 0, name: "Collection1" }])
  )
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
describe("AppSidebar End to End",() => {
    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        queryClient.clear();
    });
    afterAll(() => server.close());

    it("successfully fetches the data and renders it", async () => {
        render(
            <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>
            </QueryClientProvider>
        );

        expect(await screen.findByText("Collection1")).toBeInTheDocument();
    });
})
