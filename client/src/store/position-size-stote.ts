import { create } from "zustand";
import api from "./api";

export const usePositionSizeStore = create<any>((set, get) => ({
  positions: [],

  addPosition: async (positionData: any) => {
    try {
      const { data } = await api.post("/position-size/atr", positionData);
      set({ positions: [...get().positions, data] });
      return data;
    } catch (err) {
      console.error("Failed to add position:", err);
      throw err;
    }
  },

  fetchPositions: async () => {
    try {
      const { data } = await api.get("/position-size");
      set({ positions: data });
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    }
  },

  fetchPositionById: async (id: string) => {
    try {
      const { data } = await api.get(`/position-size/${id}`);
      return data;
    } catch (err) {
      console.error(`Failed to fetch position with id ${id}:`, err);
      return null;
    }
  },

  deletePositions: async (ids: string | string[]) => {
    try {
      const { data } = await api.delete("/position-size", {
        data: { ids },
      });

      // Remove deleted positions from state
      const idArray = Array.isArray(ids) ? ids : [ids];
      set({
        positions: get().positions.filter(
          (pos: any) => !idArray.includes(pos._id)
        ),
      });

      return data;
    } catch (err) {
      console.error("Failed to delete positions:", err);
      throw err;
    }
  },
}));
