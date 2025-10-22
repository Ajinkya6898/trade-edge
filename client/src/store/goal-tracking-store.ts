import { create } from "zustand";
import api from "./api";

interface MonthlyDistribution {
  month: string;
  targetAmount: string;
  earned: string;
  status: "Pending" | "Achieved" | "Not Achieved";
}

interface GoalProgress {
  goalActive: boolean;
  startDate?: string;
  endDate?: string;
  totalCapital?: number;
  expectedReturnPercent?: number;
  totalExpectedReturnAmount?: number;
  totalReturnPercent?: string;
  achievedAmount?: number;
  remainingAmount?: number;
  monthlyDistribution?: MonthlyDistribution[];
  goalStatus?: "Achieved" | "Expired" | "In Progress";
  message?: string;
}

interface CreateGoalData {
  totalCapital: number;
  startDate: string;
  expectedReturnPercent: number;
  timePeriod: number;
}

interface GoalState {
  progress: GoalProgress | null;
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  createError: string | null;

  fetchGoalProgress: () => Promise<void>;
  createGoal: (data: CreateGoalData) => Promise<boolean>;
  resetCreateState: () => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  progress: null,
  loading: false,
  error: null,
  createLoading: false,
  createError: null,

  fetchGoalProgress: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/goal/progress");
      set({ progress: res.data, loading: false, error: null });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
    }
  },

  createGoal: async (data: CreateGoalData) => {
    console.log("data", data);
    set({ createLoading: true, createError: null });
    try {
      // const res = await api.post("/goal", data);
      set({ createLoading: false, createError: null });
      // Optionally fetch updated progress after creating goal
      const progressRes = await api.get("/goal/progress");
      set({ progress: progressRes.data });
      return true;
    } catch (err: any) {
      set({
        createError: err.response?.data?.message || err.message,
        createLoading: false,
      });
      return false;
    }
  },

  resetCreateState: () => {
    set({ createError: null, createLoading: false });
  },
}));
