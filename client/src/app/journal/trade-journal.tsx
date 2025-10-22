import { DataTable } from "@/components/data-table";
import { useTradeStore } from "@/store/trade-store";
import { useEffect } from "react";
import tradeColumns from "./trade-journal-columns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TradingJournal = () => {
  const navigate = useNavigate();
  const { fetchTrades, trades } = useTradeStore();

  useEffect(() => {
    fetchTrades();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="@container/main mx-auto space-y-6">
        <div className="flex items-center justify-between bg-card backdrop-blur-sm rounded-lg p-6 border">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Past Trades
            </h1>
            <p className="text-md">
              Review all your executed trades with entry, exit, and P&L details
              in a structured table format.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="shadow-sm"
          >
            Back to Dashboard
          </Button>
        </div>

        <DataTable columns={tradeColumns} data={trades} />
      </div>
    </div>
  );
};

export default TradingJournal;
