import { DataTable } from "@/components/data-table";
import { usePositionSizeStore } from "@/store/position-size-stote";
import { useEffect, useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PositionSizeTable = () => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const { positions, fetchPositions, deletePositions } = usePositionSizeStore();

  useEffect(() => {
    fetchPositions();
  }, []);

  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === positions.length && positions.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(positions.map((p: any) => p._id)));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePositions(id);
      const newSelection = new Set(selectedRows);
      newSelection.delete(id);
      setSelectedRows(newSelection);
    } catch (error) {
      console.error("Failed to delete position:", error);
      // Optionally show a toast notification here
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;

    try {
      await deletePositions(Array.from(selectedRows));
      setSelectedRows(new Set());
    } catch (error) {
      console.error("Failed to delete positions:", error);
      // Optionally show a toast notification here
    }
  };

  const columns: any = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={
            selectedRows.size === positions.length && positions.length > 0
          }
          onCheckedChange={toggleAllRows}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={selectedRows.has(row.original._id)}
          onCheckedChange={() => toggleRowSelection(row.original._id)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: "stockName", header: "Stock Name" },
    { accessorKey: "entryPrice", header: "Entry Price" },
    { accessorKey: "atr", header: "ATR" },
    { accessorKey: "atrMultiplier", header: "ATR Multiplier" },
    { accessorKey: "riskPercentage", header: "Risk (%)" },
    { accessorKey: "syntheticStop", header: "Synthetic Stop" },
    { accessorKey: "riskPerShare", header: "Risk / Share" },
    { accessorKey: "riskAmount", header: "Total Risk Amount" },
    { accessorKey: "positionSize", header: "Position Size" },
    { accessorKey: "capitalUsed", header: "Capital Used" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const position = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(position._id)}
              >
                Copy Position ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(position._id)}
                className="text-red-400"
              >
                Delete Position
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      {selectedRows.size > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedRows.size} row(s) selected
          </span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}
      <DataTable data={positions} columns={columns} />
    </div>
  );
};

export default PositionSizeTable;
