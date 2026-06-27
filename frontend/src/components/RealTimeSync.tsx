import React, { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import SockJS from 'sockjs-client'
import { Client, IMessage } from '@stomp/stompjs'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/api/ws-alerts'

/**
 * RealTimeSync Component
 * Listens for global refresh signals from the backend via WebSockets
 * and invalidates React Query caches to trigger UI updates across the SPA.
 */
const RealTimeSync: React.FC = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = new SockJS(WS_URL)
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('OpsMind Sync connected')
        
        // Listen for notification-driven refreshes
        stompClient.subscribe('/topic/notifications', (message: IMessage) => {
           console.log('Global Sync: Notification received, invalidating queries...')
           queryClient.invalidateQueries({ queryKey: ['notifications'] })
           queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
        })

        // Listen for alert-driven refreshes
        stompClient.subscribe('/topic/alerts', (message: IMessage) => {
           console.log('Global Sync: Alert received, invalidating streams...')
           queryClient.invalidateQueries({ queryKey: ['alerts'] })
           queryClient.invalidateQueries({ queryKey: ['incidents'] })
           queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
        })
      }
    })

    stompClient.activate()

    return () => {
      stompClient.deactivate()
    }
  }, [queryClient])

  return null // Headless component
}

export default RealTimeSync
