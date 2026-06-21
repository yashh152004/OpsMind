import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Terminal, 
  History, 
  Settings2, 
  Trash2, 
  Zap, 
  AlertCircle,
  Copy,
  PlusCircle
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const AiChatPage: React.FC = () => {
  const location = useLocation()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Handle auto-triggering a message from navigation state (like RCA)
  useEffect(() => {
    const state = location.state as { initialMessage?: string }
    if (state?.initialMessage) {
        setInput(state.initialMessage)
        // We delay slightly to ensure the component is fully ready
        setTimeout(() => {
            const sendBtn = document.getElementById('ai-send-btn')
            sendBtn?.click()
        }, 100)
    }
  }, [location.state])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await apiClient.getChatResponse(input)
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Chat error:', error);
      
      const serverMessage = error.response?.data?.message || error.message;
      const displayContent = `CRITICAL_FAILURE: Connection to backend failed.\n\n` +
        `Error: ${serverMessage}\n` +
        `Status: ${error.response?.status || 'Network Error'}\n` +
        `URL: ${error.config?.url || 'Unknown'}\n\n` +
        `Please verify that the backend is running on http://localhost:8080 and that CORS is allowed.`;

      const errorMessage: Message = {
        role: 'assistant',
        content: displayContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-6">
      {/* Search Space / History Sidebar */}
      <div className="w-80 flex flex-col gap-6 hidden xl:flex">
         <div className="enterprise-card h-full flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
               <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <History className="h-3 w-3" /> Recent Reasoning
               </h3>
               <button className="text-primary"><PlusCircle className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 p-2 space-y-1 overflow-y-auto">
               <div className="p-3 bg-primary/5 border border-primary/20 rounded text-xs font-medium text-primary">
                 Analyzing Memory Leak in Auth...
               </div>
               <div className="p-3 hover:bg-accent rounded text-xs text-muted-foreground cursor-pointer transition-colors">
                 SLA Breach us-east-1 report
               </div>
               <div className="p-3 hover:bg-accent rounded text-xs text-muted-foreground cursor-pointer transition-colors">
                 Log summarization for build #42
               </div>
            </div>
         </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Terminal Header */}
        <div className="enterprise-card p-4 flex items-center justify-between border-l-4 border-l-primary">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-accent flex items-center justify-center rounded">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold">OpsCenter AI Copilot</h2>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter flex items-center gap-1">
                   <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> Subsystem: Gemini-1.5-Flash Online
                </p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button className="btn-ghost"><Settings2 className="h-4 w-4" /></button>
              <button className="btn-ghost text-destructive hover:bg-destructive/10" onClick={() => setMessages([])}>
                <Trash2 className="h-4 w-4" />
              </button>
           </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 enterprise-card flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                 <div className="h-16 w-16 bg-accent flex items-center justify-center rounded-full border border-border">
                    <Zap className="h-8 w-8 text-primary/50" />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg">Infrastructure Reasoning Engine</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">Ask me about current incidents, service metrics, or log anomalies. I have direct access to system telemetry.</p>
                 </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}>
                 <div className={cn(
                   "h-8 w-8 rounded flex items-center justify-center shrink-0 border",
                   msg.role === 'user' ? "bg-accent border-border" : "bg-primary/10 border-primary/20"
                 )}>
                   {msg.role === 'user' ? <History className="h-4 w-4" /> : <Terminal className="h-4 w-4 text-primary" />}
                 </div>
                 <div className={cn(
                   "p-4 rounded-lg border",
                   msg.role === 'user' 
                    ? "bg-primary text-white border-primary" 
                    : "bg-background border-border"
                 )}>
                   <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">
                     {msg.role === 'user' ? 'Operator' : 'SRE_COPILOT'}
                   </div>
                   <div className={cn(
                     "text-sm leading-relaxed whitespace-pre-wrap font-mono",
                     msg.role === 'assistant' ? "text-foreground" : "text-white"
                   )}>
                     {msg.content}
                   </div>
                 </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 max-w-[85%]">
                 <div className="h-8 w-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
                   <Terminal className="h-4 w-4 text-primary" />
                 </div>
                 <div className="bg-background border border-border p-4 rounded-lg flex items-center gap-3">
                    <LoaderDots />
                    <span className="text-xs font-mono text-muted-foreground uppercase">Running reasoning chain...</span>
                 </div>
              </div>
            )}
          </div>

          {/* Prompt Entry */}
          <div className="p-4 bg-accent/20 border-t border-border">
             <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  rows={2}
                  className="w-full bg-card border border-border rounded-lg pl-4 pr-12 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none shadow-inner"
                  placeholder="Ask a technical question... (e.g. 'Summarize S1 incidents from the last 2 hours')"
                />
                <button 
                  id="ai-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                >
                  <Send className="h-4 w-4" />
                </button>
             </div>
             <div className="mt-2 flex items-center gap-4">
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                   <AlertCircle className="h-3 w-3" /> Shift + Enter for new line
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                   <Copy className="h-3 w-3" /> Ctrl + V to paste logs
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const LoaderDots = () => (
  <div className="flex gap-1">
     {[0, 1, 2].map(i => (
       <div key={i} className="h-1 w-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
     ))}
  </div>
)

export default AiChatPage
