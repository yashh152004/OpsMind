import axios, { AxiosInstance, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { AuthResponse, AuthCredentials, User } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const { accessToken } = useAuthStore.getState()
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          const { refreshToken } = useAuthStore.getState()

          if (refreshToken) {
            try {
              const response = await this.client.post<AuthResponse>(
                '/auth/refresh',
                { refreshToken }
              )
              const { accessToken: newAccessToken } = response.data
              useAuthStore.getState().setAccessToken(newAccessToken)

              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
              return this.client(originalRequest)
            } catch (refreshError) {
              useAuthStore.getState().logout()
              window.location.href = '/login'
              return Promise.reject(refreshError)
            }
          } else {
            useAuthStore.getState().logout()
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Auth Endpoints
   */
  async register(email: string, password: string, firstName: string, lastName: string) {
    const response = await this.client.post<AuthResponse>('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    })
    return response.data
  }

  async login(credentials: AuthCredentials) {
    const response = await this.client.post<AuthResponse>('/auth/login', credentials)
    return response.data
  }

  async logout() {
    await this.client.post('/auth/logout')
    useAuthStore.getState().logout()
  }

  async refreshToken(refreshToken: string) {
    const response = await this.client.post('/auth/refresh', { refreshToken })
    return response.data
  }

  async verifyEmail(token: string) {
    const response = await this.client.post<AuthResponse>(`/auth/verify/${token}`)
    return response.data
  }

  async forgotPassword(email: string) {
    await this.client.post('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, password: string) {
    await this.client.post(`/auth/reset-password/${token}`, { password })
  }

  /**
   * User Endpoints
   */
  async getCurrentUser() {
    const response = await this.client.get<User>('/users/me')
    return response.data
  }

  async updateCurrentUser(data: Partial<User>) {
    const response = await this.client.put<User>('/users/me', data)
    return response.data
  }

  async getUsers(organizationId: string) {
    const response = await this.client.get<User[]>('/users', {
      params: { organizationId },
    })
    return response.data
  }

  async getUser(userId: string) {
    const response = await this.client.get<User>(`/users/${userId}`)
    return response.data
  }

  async createUser(organizationId: string, userData: any) {
    const response = await this.client.post<User>('/users', {
      ...userData,
      organizationId,
    })
    return response.data
  }

  async updateUser(userId: string, data: Partial<User>) {
    const response = await this.client.put<User>(`/users/${userId}`, data)
    return response.data
  }

  async deleteUser(userId: string) {
    await this.client.delete(`/users/${userId}`)
  }

  /**
   * Organization Endpoints
   */
  async getOrganizations() {
    const response = await this.client.get('/organizations')
    return response.data
  }

  async getOrganization(orgId: string) {
    const response = await this.client.get(`/organizations/${orgId}`)
    return response.data
  }

  async createOrganization(data: any) {
    const response = await this.client.post('/organizations', data)
    return response.data
  }

  async updateOrganization(orgId: string, data: Partial<any>) {
    const response = await this.client.put(`/organizations/${orgId}`, data)
    return response.data
  }

  /**
   * Incident Endpoints
   */
  async getIncidents(organizationId: string, filters?: any) {
    const response = await this.client.get('/incidents', {
      params: { organizationId, ...filters },
    })
    return response.data
  }

  async getIncident(incidentId: string) {
    const response = await this.client.get(`/incidents/${incidentId}`)
    return response.data
  }

  async createIncident(organizationId: string, data: any) {
    const response = await this.client.post('/incidents', {
      ...data,
      organizationId,
    })
    return response.data
  }

  async updateIncident(incidentId: string, data: Partial<any>) {
    const response = await this.client.put(`/incidents/${incidentId}`, data)
    return response.data
  }

  async assignIncident(incidentId: string, userId: string) {
    const response = await this.client.post(`/incidents/${incidentId}/assign`, {
      userId,
    })
    return response.data
  }

  async escalateIncident(incidentId: string) {
    const response = await this.client.post(`/incidents/${incidentId}/escalate`)
    return response.data
  }

  async resolveIncident(incidentId: string, resolution: string) {
    const response = await this.client.post(`/incidents/${incidentId}/resolve`, {
      resolution,
    })
    return response.data
  }

  /**
   * Alert Endpoints
   */
  async getAlerts(organizationId: string, filters?: any) {
    const response = await this.client.get('/alerts', {
      params: { organizationId, ...filters },
    })
    return response.data
  }

  async getAlert(alertId: string) {
    const response = await this.client.get(`/alerts/${alertId}`)
    return response.data
  }

  async acknowledgeAlert(alertId: string) {
    const response = await this.client.post(`/alerts/${alertId}/acknowledge`)
    return response.data
  }

  async resolveAlert(alertId: string) {
    const response = await this.client.post(`/alerts/${alertId}/resolve`)
    return response.data
  }

  /**
   * Analytics Endpoints
   */
  async getIncidentMetrics(organizationId: string, timeRange?: string) {
    const response = await this.client.get('/analytics/incidents/metrics', {
      params: { organizationId, timeRange },
    })
    return response.data
  }

  async getIncidentTrends(organizationId: string, timeRange?: string) {
    const response = await this.client.get('/analytics/incidents/trends', {
      params: { organizationId, timeRange },
    })
    return response.data
  }

  getAxiosInstance() {
    return this.client
  }
}

export const apiClient = new ApiClient()
