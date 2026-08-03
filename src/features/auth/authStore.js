// src/features/auth/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const ONE_DAY = 24 * 60 * 60 * 1000;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      loginAt: null,

      setAuth: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token, isLoggedIn: true, loginAt: Date.now() });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isLoggedIn: false, loginAt: null });
      },

      updateUser: (data) =>
        set((state) => ({
          user: { ...state.user, ...data },
        })),

      checkSessionExpiry: () => {
        const { isLoggedIn, loginAt, logout } = get();
        if (isLoggedIn && loginAt && Date.now() - loginAt > ONE_DAY) {
          logout();
        }
      },
    }),
    {
      name: "auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
        loginAt: state.loginAt,
      }),
    }
  )
);
