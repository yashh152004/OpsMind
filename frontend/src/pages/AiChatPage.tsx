import React, { useState } from 'react'
import { apiClient } from '@/services/api'
import { toast } from 'sonner'

const AiChatPage: React.FC = () => {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMsg = message.trim()
    setMessage('')
    setChatHistory((prev) => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)

    try {
      const response = await apiClient.getChatResponse(userMsg)
      setChatHistory((prev) => [...prev, { role: 'ai', content: response.response }])
    } catch (error) {
      toast.error('Failed to get response from Gemini')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-4">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-lg bg-card border border-border">
        {chatHistory.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            Start a conversation with OpsMind Gemini AI.
          </div>
        )}
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                chat.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-muted text-foreground'
              }`}
            >
              {chat.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg p-3 animate-pulse">
              Gemini is thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default AiChatPage
