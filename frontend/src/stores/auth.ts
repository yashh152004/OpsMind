import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthResponse } from '@/types'

interface AuthStore {
  // State
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean

  // Actions
  setAuth: (response: AuthResponse) => void
  setUser: (user: User) => void
  setAccessToken: (token: string) => void
  setRefreshToken: (token: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      setAuth: (response: AuthResponse) =>
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          error: null,
        }),

      setUser: (user: User) =>
        set({
          user,
          isAuthenticated: true,
        }),

      setAccessToken: (token: string) =>
        set({
          accessToken: token,
        }),

      setRefreshToken: (token: string) =>
        set({
          refreshToken: token,
        }),

      setLoading: (loading: boolean) =>
        set({
          isLoading: loading,
        }),

      setError: (error: string | null) =>
        set({
          error,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        }),

      clearError: () =>
        set({
          error: null,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// UI Store for global UI state
interface UIStore {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
)

// Organization Store
interface OrganizationStore {
  currentOrganizationId: string | null
  setCurrentOrganizationId: (id: string) => void
  clearCurrentOrganization: () => void
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      currentOrganizationId: null,
      setCurrentOrganizationId: (id: string) => set({ currentOrganizationId: id }),
      clearCurrentOrganization: () => set({ currentOrganizationId: null }),
    }),
    {
      name: 'organization-storage',
    }
  )
)
