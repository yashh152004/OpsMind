import React, { useState, useRef, useEffect } from 'react'
import { apiClient } from '@/services/api'
import { toast } from 'sonner'
import { 
  SendRowVerify, 
  Bot, 
  User, 
  Terminal, 
  Sparkles,
  Command,
  HelpCircle,
  Copy,
  Zap
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface Message {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

const AiChatPage: React.FC = () => {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [chatHistory, isLoading])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMsg = message.trim()
    const newMsg: Message = { role: 'user', content: userMsg, timestamp: new Date() }
    
    setMessage('')
    setChatHistory((prev) => [...prev, newMsg])
    setIsLoading(true)

    try {
      const response = await apiClient.getChatResponse(userMsg)
      const aiMsg: Message = { role: 'ai', content: response.response, timestamp: new Date() }
      setChatHistory((prev) => [...prev, aiMsg])
    } catch (error) {
      toast.error('Copilot connection lost. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-5xl mx-auto animate-fade-in">
      {/* Copilot Header */}
      <div className="flex items-center justify-between mb-6 p-4 glass-card border-l-4 border-purple-500">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
            <Bot className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-outfit">OpsMind Copilot</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Advanced Generative AI for Observability
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setChatHistory([])}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
          >
            Clear Thread
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-6 px-4 py-8 rounded-2xl bg-black/20 border border-white/5 mb-6 scrollbar-hide">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
            <div className="relative">
               <div className="absolute inset-0 blur-2xl bg-purple-500/20 rounded-full" />
               <Sparkles className="h-16 w-16 text-purple-500 relative" />
            </div>
            <div className="max-w-md">
              <h3 className="text-2xl font-bold font-outfit mb-2">How can I help you troubleshoot?</h3>
              <p className="text-muted-foreground text-sm">
                I can analyze logs, suggest fixes for incidents, or explain complex infrastructure behaviors.
              </p>
            </div>
            <div className="grid gap-3 w-full max-w-sm">
              {[
                "Analyze recent S1 incident",
                "Explain latency spikes in API gateway",
                "How to optimize MySQL query performance?",
                "Draft post-mortem for database failover"
              ].map(prompt => (
                <button 
                  key={prompt}
                  onClick={() => setMessage(prompt)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left text-sm hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-3"
                >
                  <Command className="h-4 w-4 text-primary" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-4 group animate-fade-in",
              chat.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div className={cn(
              "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center",
              chat.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-purple-500/20 text-purple-500'
            )}>
              {chat.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>
            <div className={cn(
              "relative max-w-[80%] rounded-2xl p-5 shadow-xl",
              chat.role === 'user' 
                ? 'bg-primary/90 text-white rounded-tr-none' 
                : 'bg-card border border-white/5 rounded-tl-none'
            )}>
              {chat.role === 'ai' && (
                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 rounded hover:bg-white/10" onClick={() => navigator.clipboard.writeText(chat.content)}>
                        <Copy className="h-3 w-3" />
                    </button>
                 </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {chat.content}
              </div>
              <div className={cn(
                "mt-3 text-[10px] font-bold uppercase tracking-widest opacity-40",
                chat.role === 'user' ? 'text-right' : 'text-left'
              )}>
                {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-purple-500" />
            </div>
            <div className="bg-card border border-white/5 rounded-2xl rounded-tl-none p-5 max-w-[120px]">
               <div className="flex gap-1.5">
                  <div className="h-1.5 w-1.5 bg-purple-500/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 bg-purple-500/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 bg-purple-500/50 rounded-full animate-bounce" />
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500" />
        <div className="relative bg-card border border-white/10 rounded-2xl p-2 flex items-center gap-2">
          <button type="button" className="p-3 text-muted-foreground hover:text-white transition-colors">
             <Terminal className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Copilot something or type '/' for commands..."
            className="flex-1 bg-transparent border-none outline-none px-2 py-4 text-sm text-foreground placeholder:text-muted-foreground/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="h-12 w-12 rounded-xl premium-gradient flex items-center justify-center text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Zap className="h-5 w-5" />
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Security-first AI: Your data is never used for training models.
        </p>
      </div>
    </div>
  )
}

export default AiChatPage
