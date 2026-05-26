// src/features/auth/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      setAuth: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token, isLoggedIn: true });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isLoggedIn: false });
      },

      updateUser: (data) =>
        set((state) => ({
          user: { ...state.user, ...data },
        })),
    }),
    {
      name: "auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
