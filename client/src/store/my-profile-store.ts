import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  profilePhoto?: any;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  clearError: () => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      loading: false,
      error: null,

      fetchProfile: async () => {
        set({ loading: true, error: null });
        try {
          const res = await api.get("/profile");
          set({ profile: res.data, loading: false, error: null });
        } catch (err: any) {
          set({
            error: err.response?.data?.message || err.message,
            loading: false,
          });
        }
      },

      updateProfile: async (data: Partial<Profile>) => {
        set({ loading: true, error: null });
        try {
          const res = await api.put("/profile", data);
          set({ profile: res.data, loading: false, error: null });
        } catch (err: any) {
          set({
            error: err.response?.data?.message || err.message,
            loading: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearProfile: () => {
        set({ profile: null });
      },
    }),
    {
      name: "profile-storage",
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
