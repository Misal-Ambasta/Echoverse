import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";
import { User, Timeline } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  register: (email: string, password: string) => Promise<{ success: boolean, message?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean, message?: string }>;
  logout: () => void;
  updateUserSettings: (settings: any) => Promise<{ success: boolean, message?: string }>;
}

interface TimelineState {
  timelines: Timeline[];
  timelineLoading: boolean;
  timelineError: string | null;
  fetchTimelines: () => Promise<{ success: boolean, message?: string }>;
  createTimeline: (formData: FormData) => Promise<{ success: boolean, message?: string }>;
}

type StoreState = AuthState & TimelineState;

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // AUTH
      user: null,
      token: null,
      isAuthenticated: false,
      authLoading: false,
      authError: null,

      register: async (email, password) => {
        set({ authLoading: true, authError: null });
        try {
          const res = await api.post<{ user: User, token: string, success: boolean }>("/auth/register", { email, password });
          set({ user: res.data.user, token: res.data.token, isAuthenticated: true });
          // Update the Authorization header for future API calls
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
          return { success: true };
        } catch (err: any) {
          set({ authError: err.response?.data?.message || "Registration failed" });
          return { success: false, message: err.response?.data?.message || "Registration failed" };
        } finally {
          set({ authLoading: false });
        }
      },

      login: async (email, password) => {
        set({ authLoading: true, authError: null });
        try {
          const res = await api.post<{ user: User, token: string, success: boolean }>("/auth/login", { email, password });
          set({ user: res.data.user, token: res.data.token, isAuthenticated: true });
          // Update the Authorization header for future API calls
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
          return { success: true };
        } catch (err: any) {
          set({ authError: err.response?.data?.message || "Login failed" });
          return { success: false, message: err.response?.data?.message || "Login failed" };
        } finally {
          set({ authLoading: false });
        }
      },

      logout: () => {
        // Clear user data from state
        set({ user: null, token: null, isAuthenticated: false });
        
        // Remove Authorization header
        delete api.defaults.headers.common['Authorization'];
        
        // Clear persisted data from localStorage
        localStorage.removeItem('timeline-auth-store');
      },
      
      updateUserSettings: async (settings) => {
        try {
          const token = get().token;
          const res = await api.put<{ user: User, success: boolean }>("/user/settings", settings, {
            headers: {
              Authorization: token ? `Bearer ${token}` : ''
            }
          });
          
          // Update user in state
          set({ user: res.data.user });
          return { success: true };
        } catch (err: any) {
          return { success: false, message: err.response?.data?.message || "Failed to update settings" };
        }
      },

      // TIMELINE
      timelines: [],
      timelineLoading: false,
      timelineError: null,

      fetchTimelines: async () => {
        set({ timelineLoading: true });
        try {
          // Get the token from the store
          const token = get().token;
          const res = await api.get<Timeline[]>("/timeline", {
            headers: {
              Authorization: token ? `Bearer ${token}` : ''
            }
          });
          set({ timelines: res.data });
          return { success: true };
        } catch (err: any) {
          set({ timelineError: err.response?.data?.message || "Failed to fetch timelines" });
          return { success: false, message: err.response?.data?.message || "Failed to fetch timelines" };
        } finally {
          set({ timelineLoading: false });
        }
      },

      createTimeline: async (formData) => {
        set({ timelineLoading: true, timelineError: null });
        try {
          // Get the token from the store
          const token = get().token;
          
          const res = await api.post<Timeline>("/timeline", formData, {
            headers: { 
              "Content-Type": "multipart/form-data",
              Authorization: token ? `Bearer ${token}` : ''
            },
          });
          set((state) => ({
            timelines: [...state.timelines, res.data],
          }));
          return { success: true };
        } catch (err: any) {
          set({ timelineError: err.response?.data?.message || "Timeline creation failed" });
          return { success: false, message: err.response?.data?.message || "Timeline creation failed" };
        } finally {
          set({ timelineLoading: false });
        }
      },
    }),
    {
      name: "timeline-auth-store", // key in localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token, 
        isAuthenticated: state.isAuthenticated,
        timelines: state.timelines,
      }),
    }
  )
);

// This ensures API calls work after page refresh
const token = useStore.getState().token;
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default useStore;
