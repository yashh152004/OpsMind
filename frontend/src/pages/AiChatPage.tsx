import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, Terminal, History, Settings2, Trash2, Zap, PlusCircle,
  Users, ShieldCheck, Activity, Search, Command, ArrowRight, CornerDownLeft
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

  useEffect(() => {
    const state = location.state as { initialMessage?: string }
    if (state?.initialMessage) {
        setInput(state.initialMessage)
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
      const errorMessage: Message = {
        role: 'assistant',
        content: `FATAL_ERROR: Connection to reasoning engine interrupted.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 overflow-hidden p-8 bg-white min-h-screen -m-8">
      {/* Investigation History Sidebar */}
      <div className="w-80 flex flex-col gap-4 hidden lg:flex shrink-0">
         <div className="bg-white border border-strong h-full flex flex-col rounded shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface-alt/50">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2 border-none mb-0 pb-0">
                 <History className="h-4 w-4" /> REASONING_HISTORY
               </h3>
               <button className="text-black p-1 hover:bg-black hover:text-white rounded transition-all transition-colors border border-border-strong"><PlusCircle className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-none">
               {[
                 "Auth-Service Memory Gradient",
                 "Incident #4902: RCA Correlation",
                 "Node-09: Cluster Saturation",
                 "Global Traffic Anomaly",
                 "Security Posture Scan - v4"
               ].map((title, i) => (
                 <div key={i} className={cn(
                   "p-3 rounded text-[11px] font-bold cursor-pointer transition-all border border-transparent",
                   i === 0 ? "bg-black text-white" : "text-muted hover:bg-surface-alt hover:border-border-strong"
                 )}>
                   {title}
                 </div>
               ))}
            </div>
            <div className="p-4 border-t border-border bg-surface-alt/30">
               <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest italic">
                  <ShieldCheck className="h-3.5 w-3.5" /> SECURE_ENCLAVE_ACTIVE
               </div>
            </div>
         </div>
      </div>

      {/* Primary Intelligence Core */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-[#0B0B0B] p-6 flex items-center justify-between rounded shadow-2xl border-b-2 border-b-black">
           <div className="flex items-center gap-5">
              <div className="h-10 w-10 bg-white text-black flex items-center justify-center rounded shadow-lg">
                <Terminal className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h2 className="font-black text-white text-[13px] uppercase tracking-[0.2em] font-geist m-0">REASONING_CORE_V3</h2>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">SUB_SYSTEM: INGRESS_LOGIC_ACTIVE</p>
                   </div>
                </div>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button className="h-9 w-9 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded transition-all"><Settings2 className="h-4 w-4" /></button>
              <button className="h-9 w-9 flex items-center justify-center text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded transition-all" onClick={() => setMessages([])}>
                <Trash2 className="h-4 w-4" />
              </button>
           </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 bg-white border border-strong flex flex-col overflow-hidden rounded shadow-sm">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scroll-smooth scrollbar-none">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                 <div className="h-20 w-20 bg-surface-alt flex items-center justify-center rounded border border-border-strong shadow-lg">
                    <Zap className="h-10 w-10 text-black" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="font-black text-2xl text-black tracking-tighter uppercase font-geist">Intelligence Operational Surface</h3>
                    <p className="text-[12px] text-muted max-w-sm mt-2 font-medium uppercase tracking-widest leading-relaxed">
                       Integrated with real-time telemetry, log streams, and infrastructure context.
                    </p>
                 </div>
                 <div className="columns-2 gap-4 w-full max-w-xl">
                    {["/rca latest_incident", "/predict_outages", "/summarize_logs", "/infra_health"].map(cmd => (
                      <button 
                        key={cmd}
                        onClick={() => {
                          setInput(cmd);
                          setTimeout(handleSend, 100);
                        }}
                        className="w-full mb-4 p-4 border border-border-strong bg-white rounded text-left hover:border-black hover:bg-surface-alt transition-all group"
                      >
                         <div className="text-[9px] font-black text-muted group-hover:text-black mb-1.5 uppercase tracking-widest border-l border-border-strong pl-2">TACTICAL_CMD</div>
                         <div className="text-[12px] font-mono font-black text-black">{cmd}</div>
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex gap-6",
                msg.role === 'user' ? "flex-row-reverse" : "max-w-[85%]"
              )}>
                 <div className={cn(
                   "h-10 w-10 rounded shrink-0 flex items-center justify-center shadow-lg border",
                   msg.role === 'user' ? "bg-white border-black" : "bg-black text-white border-black"
                 )}>
                   {msg.role === 'user' ? <Users className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                 </div>
                 <div className={cn(
                   "p-6 rounded border space-y-3",
                   msg.role === 'user' 
                    ? "bg-black text-white border-black shadow-xl" 
                    : "bg-surface-alt border-strong"
                 )}>
                    <div className={cn(
                      "text-[9px] font-black uppercase tracking-[0.2em] italic border-b pb-2",
                      msg.role === 'user' ? "text-white/40 border-white/10" : "text-black/30 border-black/5"
                    )}>
                      {msg.role === 'user' ? 'OPERATOR: JD' : 'ENGINE: SRE-AI-CORE'}
                    </div>
                    <div className={cn(
                      "text-[13px] leading-relaxed whitespace-pre-wrap font-medium",
                      msg.role === 'assistant' ? "text-black pr-10" : "text-white"
                    )}>
                      {msg.content}
                    </div>
                    <div className={cn(
                       "text-[8px] font-black opacity-40 uppercase tracking-widest",
                       msg.role === 'user' ? "text-right" : ""
                    )}>
                       {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                 </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-6 max-w-[85%] animate-in fade-in slide-in-from-left-4">
                 <div className="h-10 w-10 rounded bg-black flex items-center justify-center shadow-lg animate-pulse">
                   <Activity className="h-4 w-4 text-white" />
                 </div>
                 <div className="bg-surface-alt border border-strong p-6 rounded flex items-center gap-6">
                    <LoaderDots />
                    <span className="text-[10px] font-black text-black uppercase tracking-[0.3em] italic">Synthesizing_Context...</span>
                 </div>
              </div>
            )}
          </div>

          {/* Prompt Entry Core */}
          <div className="p-8 bg-surface-alt/50 border-t border-strong">
             <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  rows={2}
                  className="w-full bg-white border border-strong rounded px-6 py-5 text-[14px] font-bold text-black focus:border-black outline-none transition-all resize-none shadow-sm placeholder:text-muted/40 font-geist"
                  placeholder="Enter operational query or investigation command..."
                />
                <button 
                  id="ai-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-4 bottom-4 h-10 w-10 bg-black text-white rounded flex items-center justify-center hover:opacity-90 disabled:opacity-20 transition-all shadow-xl"
                >
                  <Send className="h-4 w-4" />
                </button>
             </div>
             <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className="text-[10px] text-muted font-bold flex items-center gap-2 uppercase tracking-widest">
                      <CornerDownLeft className="h-3 w-3" /> Shift + Enter for newline
                   </div>
                   <div className="text-[10px] text-muted font-bold flex items-center gap-2 uppercase tracking-widest">
                      <div className="h-1 w-1 bg-black rounded-full" /> Domain-Specific Intelligence Enabled
                   </div>
                </div>
                <div className="text-[9px] font-black text-black uppercase tracking-widest bg-black/5 px-2 py-1 rounded">
                   v4.2.9_STABLE
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
       <div key={i} className="h-1.5 w-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
     ))}
  </div>
)

export default AiChatPage
