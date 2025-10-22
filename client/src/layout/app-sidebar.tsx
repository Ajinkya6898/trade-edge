"use client";

import * as React from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Goal,
  LineChart,
  PieChart,
  Settings,
  Table,
  TrendingUp,
  Wallet,
  FilePlus,
  Calculator,
  IndianRupee,
} from "lucide-react";

import { NavMain } from "@/layout/nav-main";
// import { NavProjects } from "@/layout/nav-projects";
import { NavUser } from "@/layout/nav-user";
import { TeamSwitcher } from "@/layout/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
const userInfoString = localStorage.getItem("user");
const userInfo = userInfoString
  ? JSON.parse(userInfoString)
  : { name: "Guest", email: "" };

// Trading Journal Sidebar Data
const data = {
  user: {
    name: userInfo.name,
    email: userInfo.email || "ajinkya@example.com",
    avatar: "/avatars/trader.jpg",
  },
  teams: [
    {
      name: "Trading Journal",
      logo: TrendingUp,
      plan: "Personal",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Activity,
    },
    {
      title: "New Entry",
      url: "/new-entry",
      icon: FilePlus,
    },
    {
      title: "Position Sizing",
      url: "/position-size",
      icon: Calculator,
    },
    {
      title: "Capital Management",
      url: "/capital",
      icon: IndianRupee,
    },

    {
      title: "Journal",
      url: "/journal",
      icon: Table,
      items: [
        { title: "Stock Trades", url: "/trades/stocks" },
        { title: "Mutual Funds", url: "/trades/mutual-funds" },
      ],
    },
    {
      title: "Goal Tracking",
      url: "/goal-tracking",
      icon: Goal,
    },
    {
      title: "Analytics",
      url: "/reports",
      icon: BarChart3,
      items: [
        { title: "Performance Insights", url: "/reports/performance" },
        { title: "Asset Breakdown", url: "/reports/returns" },
        { title: "P&L Summary", url: "/reports/pnl" },
      ],
    },
    {
      title: "Library",
      url: "/knowledge",
      icon: BookOpen,
      items: [
        { title: "Strategy Vault", url: "/knowledge/strategies" },
        { title: "Trading Notes", url: "/knowledge/notes" },
      ],
    },
    {
      title: "Account",
      url: "/settings",
      icon: Settings,
      items: [
        { title: "My Profile", url: "/my-profile" },
        { title: "Preferences", url: "/settings/preferences" },
        { title: "Billing & Plan", url: "/settings/billing" },
      ],
    },
  ],

  projects: [
    {
      name: "Equity Portfolio",
      url: "/portfolio/equity",
      icon: LineChart,
    },
    {
      name: "Mutual Fund Portfolio",
      url: "/portfolio/mf",
      icon: PieChart,
    },
    {
      name: "Trading Capital",
      url: "/portfolio/capital",
      icon: Wallet,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
