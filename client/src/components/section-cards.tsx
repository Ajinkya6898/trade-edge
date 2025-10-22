import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { StatCard } from "./stat-card";
import { useDashboardStore } from "@/store/dashboard-store";

export function SectionCards() {
  const { data } = useDashboardStore();
  const { totalCapital, totalTrades, totalReturns, winRate } =
    data?.overview || {};

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        description="Total Capital"
        value={
          totalCapital
            ? totalCapital.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
              })
            : "—"
        }
        badgeText="Portfolio Value"
        badgeIcon={<IconTrendingUp className="h-5 w-5" />}
        badgeColor="text-orange-500"
        footerTitle="Overall Balance"
        footerIcon={""}
        footerDesc=""
        borderColor="border-l-orange-500"
      />

      <StatCard
        description="Total Trades"
        value={totalTrades}
        badgeText="Funds Deployed"
        badgeIcon={<IconTrendingUp className="h-5 w-5" />}
        badgeColor="text-purple-300"
        footerTitle="Number of trades"
        footerIcon={""}
        footerDesc=""
        borderColor="border-l-purple-300"
      />

      <StatCard
        description="Total Returns"
        value={
          totalReturns
            ? totalReturns.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
              })
            : "—"
        }
        badgeText={totalReturns && totalReturns >= 0 ? "Profitable" : "Loss"}
        badgeIcon={
          totalReturns && totalReturns >= 0 ? (
            <IconTrendingUp className="h-5 w-5" />
          ) : (
            <IconTrendingDown className="h-5 w-5" />
          )
        }
        badgeColor={
          totalReturns && totalReturns >= 0 ? "text-green-300" : "text-red-300"
        }
        footerTitle={
          totalReturns && totalReturns >= 0 ? "Net Gains" : "Net Losses"
        }
        footerIcon={""}
        footerDesc=""
        borderColor={
          totalReturns && totalReturns >= 0
            ? "border-l-green-500"
            : "border-l-red-500"
        }
      />

      <StatCard
        description="Win Rate"
        value={winRate ? `${winRate}%` : "—"}
        badgeText={winRate && winRate >= 50 ? "Above Avg." : "Needs Work"}
        badgeIcon={
          winRate && winRate >= 50 ? (
            <IconTrendingUp className="h-5 w-5" />
          ) : (
            <IconTrendingDown className="h-5 w-5" />
          )
        }
        badgeColor={
          winRate && winRate >= 50 ? "text-green-300" : "text-red-300"
        }
        footerTitle={
          winRate && winRate >= 50 ? "Consistent Wins" : "Work on Strategy"
        }
        footerIcon={""}
        footerDesc=""
        borderColor={
          winRate && winRate >= 50 ? "border-l-green-500" : "border-l-red-500"
        }
      />
    </div>
  );
}
