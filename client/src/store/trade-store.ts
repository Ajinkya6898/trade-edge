import { create } from "zustand";
import api from "./api";

interface Trade {
  _id: string;
  symbol: string;
  [key: string]: any;
}

interface TradeStore {
  trades: Trade[];
  addTrade: (trade: Trade) => Promise<void>;
  fetchTrades: () => Promise<void>;
  fetchTradeById: (id: string) => Promise<Trade | null>;
}

export const useTradeStore = create<TradeStore>((set, get) => ({
  trades: [],

  // Add a new trade and persist to DB
  addTrade: async (trade) => {
    try {
      const { data } = await api.post("/trades", trade);
      set({ trades: [...get().trades, data] });
    } catch (err) {
      console.error("Failed to add trade:", err);
      throw err;
    }
  },

  // Fetch all trades
  fetchTrades: async () => {
    try {
      const { data } = await api.get("/trades");
      set({ trades: data });
    } catch (err) {
      console.error("Failed to fetch trades:", err);
    }
  },

  // Fetch a single trade by ID
  fetchTradeById: async (id: string) => {
    try {
      const { data } = await api.get(`/trades/${id}`);
      return data; // don’t overwrite trades[] unless you want to
    } catch (err) {
      console.error(`Failed to fetch trade with id ${id}:`, err);
      return null;
    }
  },
}));
