import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api';

/**
 * Auth Store - Zustand state for authentication
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (accessToken) => {
        set({ accessToken });
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        } else {
          localStorage.removeItem('accessToken');
        }
      },

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(credentials);
          const { user, accessToken } = data.data;
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          localStorage.setItem('accessToken', accessToken);
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch { /* ignore */ }
        set({ user: null, accessToken: null, isAuthenticated: false });
        localStorage.removeItem('accessToken');
      },

      refreshUser: async () => {
        try {
          const { data } = await authApi.getMe();
          set({ user: data.data.user });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

/**
 * Wallet Store - active wallet and list
 */
export const useWalletStore = create(
  persist(
    (set, get) => ({
      wallets: [],
      activeWallet: null,
      isLoading: false,

      setWallets: (wallets) => set({ wallets }),
      setActiveWallet: (wallet) => set({ activeWallet: wallet }),

      addWallet: (wallet) =>
        set((state) => ({ wallets: [...state.wallets, wallet] })),

      removeWallet: (id) =>
        set((state) => ({
          wallets: state.wallets.filter((w) => w._id !== id),
          activeWallet: state.activeWallet?._id === id ? null : state.activeWallet,
        })),
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({ activeWallet: state.activeWallet }),
    }
  )
);

/**
 * Theme Store
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
);
