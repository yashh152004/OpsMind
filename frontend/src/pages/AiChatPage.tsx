import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Terminal, 
  History, 
  Settings2, 
  Trash2, 
  Zap, 
  PlusCircle,
  Users,
  ShieldCheck,
  Activity
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
    <div className="h-[calc(100vh-8rem)] flex gap-4 overflow-hidden -mt-2">
      {/* Search Space / History Sidebar */}
      <div className="w-80 flex flex-col gap-4 hidden lg:flex">
         <div className="bg-white border border-slate-200 h-full flex flex-col rounded-2xl shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                 <History className="h-3 w-3" /> Core Investigation History
               </h3>
               <button className="text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><PlusCircle className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
               <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs font-bold text-blue-700">
                 Analytic: Auth-Service Memory Gradient
               </div>
               <div className="p-3 hover:bg-slate-50 rounded-xl text-xs text-slate-500 font-bold cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                 Incident #4902: RCA Correlation
               </div>
               <div className="p-3 hover:bg-slate-50 rounded-xl text-xs text-slate-500 font-bold cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                 Node-09: Cluster Saturation Logic
               </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" /> E2E_ENCRYPTION_ACTIVE
               </div>
            </div>
         </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-[#0F172A] p-5 flex items-center justify-between rounded-2xl shadow-xl shadow-slate-900/10 border-b-4 border-b-blue-600">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-800 flex items-center justify-center rounded-xl border border-slate-700">
                <Terminal className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-black text-white text-sm uppercase tracking-widest">AI_SRE_COPILOT_V3</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="h-2 w-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">
                      Subsystem: Unified Reasoning Engine Active
                   </p>
                </div>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"><Settings2 className="h-4 w-4" /></button>
              <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" onClick={() => setMessages([])}>
                <Trash2 className="h-4 w-4" />
              </button>
           </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 bg-white border border-slate-200 flex flex-col overflow-hidden rounded-2xl shadow-sm">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                 <div className="h-20 w-20 bg-slate-50 flex items-center justify-center rounded-3xl border border-slate-100 shadow-sm">
                    <Zap className="h-10 w-10 text-blue-600/30" />
                 </div>
                 <div>
                    <h3 className="font-black text-xl text-[#0F172A] tracking-tight">Intelligence Operational Surface</h3>
                    <p className="text-sm text-slate-400 max-w-sm mt-2 font-medium">I am integrated with real-time telemetry, log streams, and infrastructure context. State your query for autonomous reasoning.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                    {["/rca latest_incident", "/predict_outages", "/summarize_logs", "/infra_health"].map(cmd => (
                      <button 
                        key={cmd}
                        onClick={() => {
                          setInput(cmd);
                          setTimeout(handleSend, 100);
                        }}
                        className="p-3 border border-slate-100 bg-slate-50 rounded-xl text-left hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                         <div className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 mb-1">COMMAND</div>
                         <div className="text-xs font-mono font-bold text-[#0F172A]">{cmd}</div>
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex gap-5",
                msg.role === 'user' ? "flex-row-reverse" : "max-w-[90%]"
              )}>
                 <div className={cn(
                   "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                   msg.role === 'user' ? "bg-slate-50 border-slate-200" : "bg-[#0F172A] border-slate-800"
                 )}>
                   {msg.role === 'user' ? <Users className="h-4 w-4 text-slate-500" /> : <Activity className="h-4 w-4 text-blue-400" />}
                 </div>
                 <div className={cn(
                   "p-5 rounded-2xl border min-w-[200px]",
                   msg.role === 'user' 
                    ? "bg-[#2563EB] text-white border-blue-600 shadow-lg shadow-blue-600/10" 
                    : "bg-slate-50 border-slate-100"
                 )}>
                   <div className={cn(
                     "text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60",
                     msg.role === 'user' ? "text-blue-100" : "text-slate-400"
                   )}>
                     {msg.role === 'user' ? 'Operator_SRE' : 'SYSTEM_REASONING_ENGINE'}
                   </div>
                   <div className={cn(
                     "text-sm leading-relaxed whitespace-pre-wrap font-medium",
                     msg.role === 'assistant' ? "text-[#0F172A]" : "text-white"
                   )}>
                     {msg.content}
                   </div>
                 </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-5 max-w-[90%]">
                 <div className="h-9 w-9 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-center animate-pulse shadow-sm">
                   <Activity className="h-4 w-4 text-blue-400" />
                 </div>
                 <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
                    <LoaderDots />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Executing Reasoning Chain...</span>
                 </div>
              </div>
            )}
          </div>

          {/* Prompt Entry */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100">
             <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-6 pr-14 py-4 text-sm font-medium text-[#0F172A] focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all resize-none shadow-sm placeholder:text-slate-400"
                  placeholder="Enter operational query or investigation command..."
                />
                <button 
                  id="ai-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 top-3 p-3 bg-[#2563EB] text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Send className="h-5 w-5" />
                </button>
             </div>
             <div className="mt-3 flex items-center gap-6">
                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                   <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px]">SHIFT + ENTER</kbd> New Line
                </div>
                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                   <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" /> Domain-Specific Intelligence Enabled
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
