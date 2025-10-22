import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pencil,
  Trash2,
  Circle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

const tradeColumns: ColumnDef<any>[] = [
  {
    id: "srNo",
    header: () => (
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">
        #
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center text-xs font-medium text-muted-foreground">
        {row.index + 1}
      </div>
    ),
    size: 60,
  },
  {
    // Enhanced row selection checkbox
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center mr-3">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value: any) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center mr-3">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    // Enhanced symbol column with better styling
    accessorKey: "symbol",
    header: () => <div className="text-left font-semibold">Symbol</div>,
    cell: ({ row }) => (
      <>
        {/* <Badge
          variant="outline"
          // className={`${config.color} text-xs font-medium flex items-center gap-1`}
        > */}
        <NavLink
          to={`/trade/${row.original._id}`}
          className="inline-flex items-center px-1.5 py-1.5 rounded-md hover:bg-primary/20 text-blue-500 font-medium text-sm transition-colors duration-200 hover:no-underline"
        >
          {row.original.symbol}
        </NavLink>
        {/* </Badge> */}
      </>
    ),
  },
  {
    // Enhanced status with colored badges and icons
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<string>();
      const statusConfig = {
        Open: {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Circle,
        },
        Closed: {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: CheckCircle2,
        },
        Partial: {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
        },
        Cancelled: {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
        },
      };

      const config =
        statusConfig[status as keyof typeof statusConfig] ||
        statusConfig["Open"];
      const Icon = config.icon;

      return (
        <Badge
          variant="outline"
          className={`${config.color} text-xs font-medium flex items-center gap-1`}
        >
          <Icon className="h-3 w-3" />
          {status}
        </Badge>
      );
    },
  },
  {
    // Enhanced date formatting
    accessorKey: "entryDate",
    header: "Entry Date",
    cell: ({ getValue }) => {
      const date = new Date(getValue<string>());
      return (
        <div className="text-sm">
          <div className="font-medium text-foreground">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "2-digit",
            })}
          </div>
        </div>
      );
    },
  },
  {
    // Enhanced exit date with better handling of open trades
    accessorKey: "exitDate",
    header: "Exit Date",
    cell: ({ getValue }) => {
      const val = getValue<string | undefined>();
      if (!val) {
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
          >
            Open
          </Badge>
        );
      }

      const date = new Date(val);
      return (
        <div className="text-sm">
          <div className="font-medium text-foreground">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "2-digit",
            })}
          </div>
        </div>
      );
    },
  },
  {
    // Enhanced quantity display
    accessorKey: "quantity",
    header: () => <div className="text-right font-semibold">Qty</div>,
    cell: ({ getValue }) => (
      <div className="text-right font-mono text-sm font-medium">
        {getValue<number>().toLocaleString()}
      </div>
    ),
    size: 80,
  },
  {
    // Enhanced price formatting with better typography
    accessorKey: "entryPrice",
    header: () => <div className="text-right font-semibold">Entry Price</div>,
    cell: ({ getValue }) => (
      <div className="text-right font-mono text-sm font-semibold text-foreground">
        {getValue<number>().toFixed(2)}
      </div>
    ),
    size: 110,
  },
  {
    // Enhanced exit price with conditional styling
    accessorKey: "exitPrice",
    header: () => <div className="text-right font-semibold">Exit Price</div>,
    cell: ({ getValue, row }) => {
      const exitPrice = getValue<number | undefined>();
      const entryPrice = row.original.entryPrice;

      if (exitPrice === undefined) {
        return (
          <div className="text-right text-muted-foreground text-sm">—</div>
        );
      }

      const isProfit = exitPrice > entryPrice;

      return (
        <div
          className={`text-right font-mono text-sm font-semibold ${
            isProfit ? "text-green-500" : "text-red-500"
          }`}
        >
          {exitPrice.toFixed(2)}
        </div>
      );
    },
    size: 110,
  },
  {
    accessorKey: "grossPnL",
    header: () => <div className="text-right font-semibold">Gross P&L</div>,
    cell: ({ getValue }) => {
      const grossPnL = getValue<number | undefined>();

      if (grossPnL === undefined) {
        return (
          <div className="text-right text-muted-foreground text-sm">—</div>
        );
      }

      const isProfit = grossPnL > 0;
      const isBreakeven = grossPnL === 0;

      return (
        <div
          className={`text-right font-mono text-sm font-bold ${
            isBreakeven
              ? "text-gray-500"
              : isProfit
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {isProfit ? "+" : ""}
          {grossPnL.toFixed(2)}
        </div>
      );
    },
    size: 100,
  },
  {
    // Net P&L column
    accessorKey: "netPnL",
    header: () => <div className="text-right font-semibold">Net P&L</div>,
    cell: ({ getValue }) => {
      const netPnL = getValue<number | undefined>();

      if (netPnL === undefined) {
        return (
          <div className="text-right text-muted-foreground text-sm">—</div>
        );
      }

      const isProfit = netPnL > 0;
      const isBreakeven = netPnL === 0;

      return (
        <div className="flex flex-col items-end">
          <div
            className={`font-mono text-sm font-bold ${
              isBreakeven
                ? "text-gray-500"
                : isProfit
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {isProfit ? "+" : ""}
            {netPnL.toFixed(2)}
          </div>
        </div>
      );
    },
    size: 110,
  },
  {
    accessorKey: "commission",
    header: () => <div className="text-right font-semibold">Charges</div>,
    cell: ({ getValue }) => (
      <div className="text-right font-mono text-sm text-muted-foreground">
        ${getValue<number>().toFixed(2)}
      </div>
    ),
  },

  {
    accessorKey: "atr",
    header: () => <div className="text-center font-semibold">ATR</div>,
    cell: ({ getValue }) => <div className="">{getValue<number>()}</div>,
    size: 80,
  },
  {
    accessorKey: "relativeStrength",
    header: () => <div className="text-center font-semibold">RS</div>,
    cell: ({ getValue }) => {
      const value = getValue<number>();

      return (
        <div className="text-center font-mono text-sm font-medium px-2 py-1 rounded">
          {value.toFixed(1)}
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "rsi",
    header: () => <div className="text-center font-semibold">RSI</div>,
    cell: ({ getValue }) => {
      const value = getValue<number>();

      return (
        <div className="text-center font-mono text-sm font-medium px-2 py-1 rounded">
          {value}
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "strategyAdherence",
    header: () => <div className="text-center font-semibold">Adherence</div>,
    cell: ({ getValue }) => {
      const adherence = getValue<boolean>();

      return (
        <div className="flex justify-center">
          {adherence ? (
            <Badge className="bg-green-100">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Yes
            </Badge>
          ) : (
            <Badge className="bg-red-100">
              <XCircle className="h-3 w-3 mr-1" />
              No
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    // Enhanced actions with tooltips and better styling
    id: "actions",
    header: () => <div className="text-center font-semibold">Actions</div>,
    cell: () => (
      <div className="flex gap-1 justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit trade</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete trade</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
    enableSorting: false,
  },
];

export default tradeColumns;
