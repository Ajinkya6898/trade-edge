import { create } from "zustand";
import api from "./api";

interface GeminiState {
  loading: boolean;
  error: string | null;
  improveNotes: (
    notes: string,
    reflection: string
  ) => Promise<{
    notes: string;
    reflection: string;
  } | null>;
}

export const useGeminiStore = create<GeminiState>((set) => ({
  loading: false,
  error: null,

  improveNotes: async (notes, reflection) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/note/improve", {
        notes,
        reflection,
      });
      // assuming backend returns { notes: "...", reflection: "..." }
      set({ loading: false });
      return res.data;
    } catch (err: any) {
      set({
        loading: false,
        error: err.response?.data?.message || err.message,
      });
      return null;
    }
  },
}));
