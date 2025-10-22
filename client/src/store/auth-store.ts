import { create } from "zustand";
import api from "./api";
import { useProfileStore } from "./my-profile-store";

interface User {
  id: string;
  name: string;
  email: string;
  // extend based on your backend response
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
  login: async (email: string, password: string): Promise<boolean> => {
    set({ loading: true, error: null });

    try {
      const { data } = await api.post("/auth/login", { email, password });

      const { token, user } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({ user, token, loading: false, error: null });
      const fetchProfile = useProfileStore.getState().fetchProfile;
      await fetchProfile();
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message,
        loading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
    useProfileStore.setState({ profile: null });
  },
}));
