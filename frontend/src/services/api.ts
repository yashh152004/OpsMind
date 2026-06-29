import axios, { AxiosInstance, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { AuthResponse, AuthCredentials, User, RegisterRequest, Notification } from '@/types'

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

    // Response interceptor to handle errors and refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response) {
            console.error(`API Error [${error.response.status}]:`, error.response.data);
            
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true
                const { refreshToken } = useAuthStore.getState()

                if (refreshToken) {
                    try {
                        const response = await this.client.post<AuthResponse>('/auth/refresh', { refreshToken })
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
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Auth Endpoints
   */
  async register(data: RegisterRequest) {
    const response = await this.client.post<AuthResponse>('/auth/register', data)
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

  /**
   * User Endpoints
   */
  async getCurrentUser() {
    const response = await this.client.get<User>('/users/me')
    return response.data
  }

  async updateProfile(data: Partial<User>) {
    const response = await this.client.put<User>('/users/me', data)
    return response.data
  }

  async getUsers() {
    const response = await this.client.get<User[]>('/users')
    return response.data
  }

  async deleteUser(userId: string) {
    await this.client.delete(`/users/${userId}`)
  }

  /**
   * Incident Endpoints
   */
  async searchIncidents(params: { q?: string, status?: string, severity?: string, page?: number, size?: number, sort?: string }) {
    const response = await this.client.get('/incidents/search', { params })
    return response.data
  }

  async createIncident(organizationId: string | number, data: any) {
    const orgIdNum = typeof organizationId === 'string' && !isNaN(Number(organizationId)) 
        ? Number(organizationId) 
        : organizationId;

    const response = await this.client.post('/incidents', {
      ...data,
      organizationId: orgIdNum === 'default' ? null : orgIdNum,
    })
    return response.data
  }

  async createOrganization(data: any) {
    const response = await this.client.post('/organizations', data)
    return response.data
  }

  async resolveIncident(incidentId: string | number, resolution: string) {
    const response = await this.client.post(`/incidents/${incidentId}/resolve`, {
      resolution,
    })
    return response.data
  }

  async updateIncidentStatus(incidentId: string | number, status: string, note?: string, operator?: string) {
    const response = await this.client.put(`/incidents/${incidentId}/status`, {
      status,
      note,
      operator
    })
    return response.data
  }

  async assignIncident(incidentId: string | number, userId: string, operator?: string) {
    const response = await this.client.post(`/incidents/${incidentId}/assign`, {
      userId,
      operator
    })
    return response.data
  }

  async getIncidentTimeline(incidentId: string | number) {
    const response = await this.client.get(`/incidents/${incidentId}/timeline`)
    return response.data
  }

  async bulkResolveIncidents(ids: (string | number)[]) {
    const response = await this.client.post('/incidents/bulk-resolve', ids)
    return response.data
  }

  /**
   * Alert Endpoints
   */
  async getAlerts(organizationId: string | number) {
    const response = await this.client.get('/alerts', {
      params: { organizationId },
    })
    return response.data
  }

  async acknowledgeAlert(id: number | string) {
    const response = await this.client.post(`/alerts/${id}/acknowledge`)
    return response.data
  }

  /**
   * Infrastructure Endpoints
   */
  async getInfrastructureAssets() {
    const response = await this.client.get('/infrastructure/assets')
    return response.data
  }

  async performInfrastructureScan() {
    const response = await this.client.post('/infrastructure/scan')
    return response.data
  }

  async getInfrastructureTopology() {
    const response = await this.client.get('/infrastructure/topology')
    return response.data
  }

  /**
   * Export System (Phase 5)
   */
  async exportModule(module: string) {
    const response = await this.client.get(`/export/${module}`, {
      responseType: 'blob'
    })
    return response.data
  }

  async exportTelemetry() {
    const response = await this.client.get('/export/telemetry', {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Settings (Phase 3)
   */
  async getSettings() {
    const response = await this.client.get('/settings')
    return response.data
  }

  async updateSettings(settings: Record<string, string>) {
    const response = await this.client.post('/settings', settings)
    return response.data
  }

  async getAuditLogs() {
    const response = await this.client.get('/audit')
    return response.data
  }

  /**
   * Storage (Phase 2)
   */
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await this.client.post('/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Notification Endpoints
   */
  async getNotifications() {
    const response = await this.client.get<Notification[]>('/notifications')
    return response.data
  }

  async markNotificationAsRead(id: number | string) {
    await this.client.post(`/notifications/${id}/read`)
  }

  async markAllNotificationsAsRead() {
    await this.client.post('/notifications/read-all')
  }

  /**
   * Search Endpoints
   */
  async globalSearch(query: string) {
    const response = await this.client.get('/search', {
      params: { q: query }
    })
    return response.data
  }

  /**
   * AI & Copilot Endpoints
   */
  async getChatResponse(message: string) {
    const response = await this.client.post<{ response: string }>('/ai/chat', { message })
    return response.data
  }

  async getAiInsights() {
    const response = await this.client.get('/ai/insights')
    return response.data
  }

  async getConversations() {
    const response = await this.client.get('/ai/conversations')
    return response.data
  }

  async createConversation(title?: string) {
    const response = await this.client.post('/ai/conversations', { title })
    return response.data
  }

  async getConversationMessages(id: number | string) {
    const response = await this.client.get(`/ai/conversations/${id}/messages`)
    return response.data
  }

  async sendConversationMessage(id: number | string, content: string) {
    const response = await this.client.post(`/ai/conversations/${id}/messages`, { content })
    return response.data
  }

  streamConversationMessage(id: number | string, content: string, onChunk: (chunk: string) => void) {
    const { accessToken } = useAuthStore.getState();
    return fetch(`${API_BASE_URL}/ai/conversations/${id}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ content })
    }).then(async response => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // SSE format: data: <content>\n\n
        const lines = chunk.split('\n');
        for (const line of lines) {
           if (line.startsWith('data:')) {
              onChunk(line.replace('data:', ''));
           }
        }
      }
    });
  }

  async renameConversation(id: number | string, title: string) {
    await this.client.patch(`/ai/conversations/${id}/rename`, { title })
  }

  async deleteConversation(id: number | string) {
    await this.client.delete(`/ai/conversations/${id}`)
  }

  async togglePinConversation(id: number | string) {
    await this.client.post(`/ai/conversations/${id}/pin`)
  }

  async archiveConversation(id: number | string) {
    await this.client.post(`/ai/conversations/${id}/archive`)
  }

  /**
   * Demo & Simulation
   */
  async triggerSimulation(type: string) {
    const response = await this.client.post(`/simulator/trigger/${type}`)
    return response.data
  }

  /**
   * Integrations
   */
  async getIntegrations() {
    const response = await this.client.get('/integrations')
    return response.data
  }

  async connectIntegration(data: any) {
    const response = await this.client.post('/integrations/connect', data)
    return response.data
  }

  /**
   * Summary & Dashboard Endpoints
   */
  async getDashboardStats() {
    const response = await this.client.get('/summary/stats')
    return response.data
  }

  /**
   * Analytics Endpoints
   */
  async getAnalyticsTrends() {
    const response = await this.client.get('/analytics/trends')
    return response.data
  }

  /**
   * Security Endpoints
   */
  async getSecurityFindings() {
    const response = await this.client.get('/security/findings')
    return response.data
  }

  async performSecurityScan() {
    const response = await this.client.post('/security/scan')
    return response.data
  }
}

export const apiClient = new ApiClient()
