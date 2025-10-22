import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { useDashboardStore } from "@/store/dashboard-store";
import { useEffect } from "react";

export default function Dashboard() {
  const { fetchDashboard } = useDashboardStore();
  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
            {/* <DataTable data={data} columns={columns} /> */}
          </div>
          {/* <DataTable data={data} /> */}

          <div className="flex flex-col lg:flex-row gap-4 px-4 lg:px-6">
            <div className="flex-1 flex">
              <div className="w-full h-full"></div>
            </div>
            <div className="flex-1 flex">
              <div className="w-full h-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
