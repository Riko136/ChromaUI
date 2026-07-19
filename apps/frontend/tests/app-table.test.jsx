import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import AppTable from "@/components/app-table";
import { useItemColumns } from "@/hooks/use-item-columns";


const mockRows = [
  { id: "1", document: "doc one", metadata: { "source": "test" } },
  { id: "2", document: "doc two", metadata: null },
];

function useTestTable(data = mockRows) {

  const columns = useItemColumns(null, null)

  return useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
}

const setup = (overrides = {}) => {
  const { result } = renderHook(() => useTestTable(overrides.data));

  const defaultProps = {
    table: result.current,
    isLoading: false,
    isError: false,
    error: null,
    onRowClick: jest.fn(),
    openItemId: null,
  };

  const props = { ...defaultProps, ...overrides };
  render(<AppTable {...props} />);

  return { props };
};   


describe(AppTable, () =>{

    it("renders without any data successfully", async () => {
        setup({data: []})
        expect(await screen.findByText("No results.")).toBeInTheDocument();
    })

    it("renders with data successfully", async () => {
        setup()
        expect(await screen.findByText("doc one")).toBeInTheDocument()
        expect(await screen.findByText("doc two")).toBeInTheDocument()
        expect(await screen.findByText('{"source":"test"}')).toBeInTheDocument()
    })

    it("fails successfully", async () => {
        setup({isError: true})
        expect(await screen.findByText("Failed to load")).toBeInTheDocument()
    })

})