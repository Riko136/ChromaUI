import AppSidebar from "@/components/app-sidebar";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useCollections } from "@/lib/queries"


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

jest.mock("@/lib/queries");

const setup = () => {
    render(
        <QueryClientProvider client={queryClient}>
            <SidebarProvider>
            <AppSidebar />
            </SidebarProvider>
        </QueryClientProvider>
    )
}

const setupEmpty = () =>{
    jest.mocked(useCollections).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
    });
    setup()
}

const setupWithData = () => {
    jest.mocked(useCollections).mockReturnValue({
        data: [{id: 0, name: "Collection1"}],
        isLoading: false,
        isError: false,
        error: null,
    });
    setup()    
}

const setupIsError = () => {
    jest.mocked(useCollections).mockReturnValue({
        data: [],
        isLoading: false,
        isError: true,
        error: null,
    });
    setup()    
}

const setupIsLoading = () => {
    jest.mocked(useCollections).mockReturnValue({
        data: [],
        isLoading: true,
        isError: false,
        error: null,
    });
    setup()    
}

describe(AppSidebar, () => {

    beforeAll(() => {
        jest.clearAllMocks();
    });
    
    it("renders with no collections successfully", async () => {
        setupEmpty()
        expect(await screen.findByText("No collections yet")).toBeInTheDocument();
    })

    it("renders with collections successfully", async () => {
        setupWithData()
        expect(await screen.findByText("Collection1")).toBeInTheDocument();
    })

    it("renders an error successfully", async () => {
        setupIsError()
        expect(await screen.findByText("Failed to load")).toBeInTheDocument();
    })

    it("renders the loading state successfully", () => {
        setupIsLoading()
        expect(screen.getAllByRole('listitem', {Name: ""})).toHaveLength(4);
    })

})