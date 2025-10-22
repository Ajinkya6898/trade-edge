"use client";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout";
import Dashboard from "@/app/dashboard/dashboard";
import TradeDetailsPage from "@/app/trade/details";
import LoginPage from "@/app/auth/LoginPage";
import NweEntry from "@/app/new-entry/new-entry";
import PositionCalculator from "@/app/position-size/position-calculator";
import MyProfilePage from "@/app/auth/Profile";
import TradingJournal from "@/app/journal/trade-journal";
import CapitalManagement from "@/app/capital/capital";
import GoalTracking from "@/app/goal-tracking/goal-tracking";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/new-entry", element: <NweEntry /> },
      { path: "/position-size", element: <PositionCalculator /> },
      { path: "/my-profile", element: <MyProfilePage /> },
      { path: "/journal", element: <TradingJournal /> },
      { path: "/trade/:id", element: <TradeDetailsPage /> },
      { path: "/capital", element: <CapitalManagement /> },
      { path: "/goal-tracking", element: <GoalTracking /> },
    ],
  },
  {
    index: true,
    path: "/auth/login",
    element: <LoginPage />,
  },
]);

export default router;
