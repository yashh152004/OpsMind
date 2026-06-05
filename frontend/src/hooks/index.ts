import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore, useOrganizationStore } from '@/stores/auth'
import { apiClient } from '@/services/api'
import type { AuthCredentials, AuthResponse, User } from '@/types'

/**
 * Authentication Hook
 */
export const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, accessToken, isAuthenticated, setAuth, logout: storeLogout, setUser } = useAuthStore()

  // Current user query
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isAuthenticated && !user,
  })

  // Update store when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
    }
  }, [currentUser, setUser])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: AuthCredentials) =>
      apiClient.login(credentials),
    onSuccess: (data: AuthResponse) => {
      setAuth(data)
      queryClient.setQueryData(['user', 'current'], data.user)
      navigate('/dashboard')
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: {
      email: string
      password: string
      firstName: string
      lastName: string
    }) => apiClient.register(data.email, data.password, data.firstName, data.lastName),
    onSuccess: () => {
      navigate('/verify-email')
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      storeLogout()
      queryClient.clear()
      navigate('/login')
    },
  })

  return {
    user: user || currentUser,
    accessToken,
    isAuthenticated,
    isLoading: userLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}

/**
 * Protected Route Hook
 */
export const useRequireAuth = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  return { isLoading, isAuthenticated }
}

/**
 * Organization Hook
 */
export const useOrganization = () => {
  const { currentOrganizationId, setCurrentOrganizationId } = useOrganizationStore()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.organizationId && !currentOrganizationId) {
      setCurrentOrganizationId(user.organizationId)
    }
  }, [user, currentOrganizationId, setCurrentOrganizationId])

  return { organizationId: currentOrganizationId || user?.organizationId }
}

/**
 * Async Data Fetching Hook
 */
export const useAsyncData = <T,>(
  key: string[],
  fn: () => Promise<T>,
  options = {}
) => {
  return useQuery({
    queryKey: key,
    queryFn: fn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

/**
 * Async Mutation Hook
 */
export const useAsyncMutation = <T, D = void>(
  fn: (data: D) => Promise<T>,
  options = {}
) => {
  return useMutation({
    mutationFn: fn,
    ...options,
  })
}

/**
 * Local Storage Hook
 */
export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue] as const
}

/**
 * Debounce Hook
 */
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Import React
import * as React from 'react'
