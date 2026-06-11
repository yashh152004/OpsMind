import { useEffect, useState } from 'react'
import SockJS from 'sockjs-client'
import { Client, IMessage } from '@stomp/stompjs'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/api/ws-alerts'

export const useAlertStream = (onAlertReceived: (alert: any) => void) => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socket = new SockJS(WS_URL)
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str: string) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    stompClient.onConnect = () => {
      setIsConnected(true)
      stompClient.subscribe('/topic/alerts', (message: IMessage) => {
        if (message.body) {
          const alert = JSON.parse(message.body)
          onAlertReceived(alert)
        }
      })
    }

    stompClient.onDisconnect = () => {
      setIsConnected(false)
    }

    stompClient.activate()

    return () => {
      stompClient.deactivate()
    }
  }, [onAlertReceived])

  return { isConnected }
}
