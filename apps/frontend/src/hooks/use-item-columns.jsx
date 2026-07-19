import { useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"

export function useItemColumns(debouncedInput, searchMode) {
  return useMemo(() => {
    const cols = [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: "32px",
        enableSorting: false,
        enableHiding: false,
      },
      { accessorKey: "id", header: "ID", size: "auto" },
      { accessorKey: "document", header: "Document", size: "900px" },
      {
        accessorKey: "metadata",
        header: "Metadata",
        size: "auto",
        cell: ({ getValue }) => {
          const v = getValue()
          return v ? <code className="text-xs">{JSON.stringify(v)}</code> : "—"
        },
      },
    ]

    if (debouncedInput && searchMode[0] === "semantic") {
      cols.push({
        accessorKey: "distance",
        header: "Distance",
        size: "auto",
        cell: ({ getValue }) => {
          const v = getValue()
          return typeof v === "number" ? v.toFixed(4) : "—"
        },
      })
    }

    return cols
  }, [debouncedInput, searchMode]);
}