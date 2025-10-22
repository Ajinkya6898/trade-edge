import { create } from "zustand";
import api from "./api";

interface CapitalTransaction {
  id: string;
  type: "add" | "withdraw";
  amount: number;
  date: string;
  description?: string;
}

interface CapitalData {
  totalCapital: number;
  transactions: CapitalTransaction[];
}

interface CapitalStore {
  capital: CapitalData | null;
  loading: boolean;
  error: string | null;

  fetchCapital: () => Promise<void>;
  addCapital: (
    amount: number,
    description?: string
  ) => Promise<CapitalTransaction>;
  withdrawCapital: (
    amount: number,
    description?: string
  ) => Promise<CapitalTransaction>;
  clearError: () => void;
}

export const useCapitalStore = create<CapitalStore>((set, get) => ({
  capital: null,
  loading: false,
  error: null,

  fetchCapital: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/capital");
      set({ capital: data, loading: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch capital data";
      set({ error: errorMessage, loading: false });
      console.error("Failed to fetch capital:", err);
    }
  },

  addCapital: async (amount: number, description?: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/capital", {
        type: "add",
        amount,
        note: description,
      });

      // Update the capital state with new transaction
      const currentCapital = get().capital;
      if (currentCapital) {
        set({
          capital: {
            totalCapital: currentCapital.totalCapital + amount,
            transactions: [...currentCapital.transactions, data],
          },
          loading: false,
        });
      } else {
        // If no capital data exists, fetch it
        await get().fetchCapital();
      }
      await get().fetchCapital();

      return data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to add capital";
      set({ error: errorMessage, loading: false });
      console.error("Failed to add capital:", err);
      throw err;
    }
  },

  withdrawCapital: async (amount: number, description?: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post("/capital", {
        type: "withdraw",
        amount,
        note: description,
      });

      // Update the capital state with new transaction
      const currentCapital = get().capital;
      if (currentCapital) {
        set({
          capital: {
            totalCapital: currentCapital.totalCapital - amount,
            transactions: [...currentCapital.transactions, data],
          },
          loading: false,
        });
      } else {
        // If no capital data exists, fetch it
        await get().fetchCapital();
      }
      await get().fetchCapital();

      return data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to withdraw capital";
      set({ error: errorMessage, loading: false });
      console.error("Failed to withdraw capital:", err);
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
