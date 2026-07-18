import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, Pin, Trash2, Send, Search, MoreVertical, 
  Activity, Sparkles, ChevronRight, X, Terminal, Shield, 
  AlertTriangle, Cpu, Globe, Share2, StopCircle, Copy, ThumbsUp, 
  ThumbsDown, RefreshCcw, Command, SlidersHorizontal, Paperclip, Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'
import { apiClient } from '@/services/api'
import { toast } from 'sonner'

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

const STARTER_PROMPTS = [
  { id: 'p1', text: 'Analyze the latest Critical (P1) incident', icon: AlertTriangle, desc: 'Root cause analysis' },
  { id: 'p2', text: 'Identify unhealthy nodes in us-east-1', icon: Cpu, desc: 'Infrastructure check' },
  { id: 'p3', text: 'Summarize system telemetry for the last 6h', icon: Activity, desc: 'Performance audit' },
  { id: 'p4', text: 'Check for potential security signal breaches', icon: Shield, desc: 'Security posture' },
]

export default function AiChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | number | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // --- Queries ---
  const { data: conversations, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => apiClient.getConversations()
  })

  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['ai-messages', activeConversationId],
    queryFn: () => activeConversationId ? apiClient.getConversationMessages(activeConversationId) : Promise.resolve([]),
    enabled: !!activeConversationId
  })

  // --- Mutations ---
  const createConvMutation = useMutation({
    mutationFn: (title: string) => apiClient.createConversation(title),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
      setActiveConversationId(newConv.id)
      toast.success("Investigation shard initialized.")
    }
  })

  const deleteConvMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
      if (activeConversationId) setActiveConversationId(null)
      toast.info("Investigation decommissioned.")
    }
  })

  const pinMutation = useMutation({
    mutationFn: (id: string) => apiClient.togglePinConversation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
  })

  const [isSending, setIsSending] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)

  const handleSend = async (contentOverride?: string) => {
    const finalContent = contentOverride || inputValue.trim()
    if (!finalContent || isSending) return
    
    setIsSending(true)
    setInputValue("")
    
    let convId = activeConversationId
    
    try {
      if (!convId) {
        const newConv = await createConvMutation.mutateAsync("Active Investigation")
        convId = newConv.id
        setActiveConversationId(convId)
      }

      setStreamingContent("")
      
      let fullText = ""
      await apiClient.streamConversationMessage(convId!.toString(), finalContent, (chunk) => {
        fullText += chunk
        setStreamingContent(fullText)
      })
      
      setStreamingContent(null)
      queryClient.invalidateQueries({ queryKey: ['ai-messages', convId] })
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
    } catch (error: any) {
      toast.error("Transmission failure. Signal lost.")
      setStreamingContent(null)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  useEffect(() => {
     if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
     }
  }, [inputValue])

  const activeConversation = conversations?.find((c: any) => c.id === activeConversationId)
  const filteredConversations = conversations?.filter((c: any) => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background text-foreground">
      {/* Search & History Sidebar */}
      <aside className={cn(
        "bg-surface border-r border-border flex flex-col transition-all duration-200 z-20 h-full",
        isSidebarOpen ? "w-[280px]" : "w-0 overflow-hidden border-r-0"
      )}>
        <div className="p-4 pb-2 text-left">
           <button 
             onClick={() => createConvMutation.mutate("New Investigation")}
             className="w-full btn-primary h-8.5 gap-1.5 text-[13px]"
           >
              <Plus className="h-4 w-4" />
              <span>New Investigation</span>
           </button>
        </div>

        <div className="p-3 px-4">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <input 
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-enterprise pl-9 h-8.5 w-full font-normal"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 no-scrollbar">
           <div className="space-y-0.5">
              {isHistoryLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-12 skeleton-ui mx-2 rounded-lg opacity-80 animate-pulse" />
                ))
              ) : (
                filteredConversations?.map((conv: any) => (
                  <div key={conv.id} className="group relative">
                    <button
                      onClick={() => setActiveConversationId(conv.id)}
                      className={cn(
                        "w-full px-3 py-2.5 rounded-[var(--radius)] text-left transition-all duration-150 flex flex-col gap-1 border border-transparent",
                        activeConversationId === conv.id 
                          ? "bg-secondary text-foreground shadow-xs border-border-strong/10" 
                          : "hover:bg-surface-hover/80"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[13px] font-semibold truncate max-w-[180px]",
                          activeConversationId === conv.id ? "text-foreground" : "text-foreground/80"
                        )}>
                          {conv.title}
                        </span>
                        {conv.pinned && <Pin className="h-3 w-3 text-foreground fill-foreground" />}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
                         <span>{conv.updatedAt ? format(new Date(conv.updatedAt), 'MMM d') : 'Draft'}</span>
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); pinMutation.mutate(conv.id); }} className="hover:text-foreground transition-colors"><Pin className="h-3 w-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteConvMutation.mutate(conv.id); }} className="hover:text-red-500 transition-colors"><Trash2 className="h-3 w-3" /></button>
                         </div>
                      </div>
                    </button>
                  </div>
                ))
              )}
           </div>
        </div>

        <div className="p-3.5 bg-surface-alt border-t border-border text-left">
           <div className="flex items-center gap-2.5 px-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex-1 min-w-0">
                 <div className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-none truncate">Standard_Reasoning_v4</div>
                 <div className="text-[9px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Status: Optimal</div>
              </div>
           </div>
        </div>
      </aside>

      {/* Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative z-10 h-full">
        <header className="h-12 border-b border-border px-6 flex items-center justify-between bg-surface/80 backdrop-blur-xs sticky top-0 z-30">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-1.5 hover:bg-surface-hover rounded-md transition-colors text-muted-foreground"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              <div className="flex flex-col text-left">
                 <h1 className="text-[13px] font-semibold tracking-wider text-foreground uppercase leading-none">
                    {activeConversation ? activeConversation.title : 'Shard_Initiation'}
                 </h1>
                 <div className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-widest mt-0.5">
                    <Terminal className="h-2.5 w-2.5" /> Logical_Loop: {activeConversationId ? `0x${activeConversationId.toString().slice(-4)}` : 'UNSYNCED'}
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 bg-surface-alt px-2.5 py-0.5 rounded-md border border-border">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Secure Stream</span>
              </div>
              <button className="p-1.5 hover:bg-surface-hover rounded-md transition-colors text-muted-foreground hover:text-foreground">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-1.5 hover:bg-surface-hover rounded-md transition-colors text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
           </div>
        </header>

        <section className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
           <div className="max-w-3xl mx-auto px-6 py-10 space-y-10 min-h-full flex flex-col">
              {!activeConversationId && !messages?.length ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 py-12">
                    <div className="relative">
                       <span className="h-14 w-14 bg-foreground text-background rounded-2xl flex items-center justify-center relative shadow-lg">
                          <Sparkles className="h-6 w-6" />
                       </span>
                    </div>
                    <div className="space-y-3">
                       <h2 className="text-[26px] font-bold tracking-tight text-foreground">SRE Intelligence Copilot</h2>
                       <p className="text-muted-foreground text-[14px] max-w-md font-normal leading-relaxed">
                          Enterprise-grade reasoning for the modern observability stack. Investigate incidents, analyze infrastructure, and predict failure vectors.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full max-w-xl">
                       {STARTER_PROMPTS.map((p) => (
                         <button
                           key={p.id}
                           onClick={() => handleSend(p.text)}
                           className="flex items-start gap-3.5 p-4.5 bg-surface border border-border rounded-[var(--radius)] hover:border-border-strong hover:bg-surface-alt transition-all text-left group"
                         >
                            <div className="h-8 w-8 bg-surface-alt border border-border rounded-lg flex items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-background shrink-0 mt-0.5">
                               <p.icon className="h-4 w-4 text-muted-foreground group-hover:text-current" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <span className="block text-[13px] font-semibold text-foreground mb-0.5">{p.text}</span>
                               <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{p.desc}</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-border group-hover:text-foreground transition-all mt-1" />
                         </button>
                       ))}
                    </div>
                </div>
              ) : (
                <div className="space-y-10">
                   {messages?.map((msg: any) => (
                     <div key={msg.id} className="group flex flex-col gap-3.5 text-left">
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold border",
                             msg.role === 'USER' ? "bg-secondary text-foreground border-border-strong/10" : "bg-foreground text-background border-transparent"
                           )}>
                              {msg.role === 'USER' ? 'SRE' : 'AI'}
                           </span>
                           <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                              {msg.role === 'USER' ? 'Operator Command' : 'OpsMind Core Response'}
                           </span>
                           <span className="text-[10px] text-muted-foreground font-semibold bg-surface-alt px-1.5 py-0.5 rounded border border-border">
                              {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm:ss') : '--:--:--'}
                           </span>
                        </div>
                        
                        <div className={cn(
                           "relative p-5 rounded-[var(--radius)] text-[14.5px] leading-relaxed border transition-all text-left",
                           msg.role === 'USER' 
                             ? "bg-surface-alt border-border text-foreground ml-6" 
                             : "bg-surface border-border mr-6 shadow-xs"
                        )}>
                           <div className="prose prose-neutral max-w-none prose-sm dark:prose-invert">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                 {msg.content}
                              </ReactMarkdown>
                           </div>
                           
                           {msg.role === 'ASSISTANT' && (
                             <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 hover:bg-surface-alt rounded-md transition-colors text-muted-foreground hover:text-foreground" title="Copy"><Copy className="h-3.5 w-3.5" /></button>
                                <button className="p-1.5 hover:bg-surface-alt rounded-md transition-colors text-muted-foreground hover:text-foreground"><ThumbsUp className="h-3.5 w-3.5" /></button>
                                <button className="p-1.5 hover:bg-surface-alt rounded-md transition-colors text-muted-foreground hover:text-foreground"><ThumbsDown className="h-3.5 w-3.5" /></button>
                                <button className="p-1.5 hover:bg-surface-alt rounded-md transition-colors text-muted-foreground hover:text-foreground"><RefreshCcw className="h-3.5 w-3.5" /></button>
                             </div>
                           )}
                        </div>
                     </div>
                   ))}
                   
                   {streamingContent !== null && (
                      <div className="flex flex-col gap-3.5 text-left">
                         <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-md bg-foreground flex items-center justify-center text-background">
                               <Sparkles size={11} className="animate-pulse" />
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground animate-pulse">Processing_Inference...</span>
                         </div>
                         <div className="bg-surface border border-border p-5 rounded-[var(--radius)] mr-6 shadow-xs text-left">
                            <div className="prose prose-neutral max-w-none prose-sm dark:prose-invert">
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                 {streamingContent || "Initializing semantic cross-linkage..."}
                               </ReactMarkdown>
                            </div>
                         </div>
                      </div>
                   )}
                   <div ref={messagesEndRef} className="h-10" />
                </div>
              )}
           </div>
        </section>

        {/* Input Dock */}
        <footer className="p-5 bg-background border-t border-border z-30">
           <div className="max-w-3xl mx-auto space-y-3.5">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <ActionBadge icon={Paperclip} label="Logs" />
                    <ActionBadge icon={Globe} label="Infra" />
                    <ActionBadge icon={Shield} label="Security" />
                 </div>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { setInputValue(""); setActiveConversationId(null); }}
                      className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-red-500 flex items-center gap-1.5 transition-colors"
                    >
                       <X className="h-3.5 w-3.5" /> Clear Buffer
                    </button>
                    <span className="text-[10px] font-bold text-border uppercase tracking-widest hidden sm:block">
                       SLO: 99.9%
                    </span>
                 </div>
              </div>

              <div className={cn(
                "relative group bg-surface rounded-[var(--radius)] border border-border transition-all duration-150",
                "focus-within:border-border-strong focus-within:shadow-xs",
                streamingContent !== null && "opacity-90 pointer-events-none"
              )}>
                 <textarea
                   ref={textareaRef}
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="Consult OpsMind Copilot for telemetry reasoning..."
                   className="w-full bg-transparent border-none rounded-[var(--radius)] py-3.5 pl-5 pr-24 text-[14px] font-medium leading-relaxed resize-none focus:ring-0 placeholder:text-muted-foreground/75 outline-none"
                   rows={1}
                 />
                 
                 <div className="absolute right-3.5 bottom-2.5 flex items-center gap-2">
                    {isSending || streamingContent !== null ? (
                       <button 
                         onClick={() => setStreamingContent(null)}
                         className="h-8 px-3 flex items-center justify-center bg-red-950/20 text-red-500 border border-red-900/30 rounded-[var(--radius)] hover:bg-opacity-80 transition-colors text-[10px] font-bold uppercase tracking-wider"
                       >
                          <StopCircle className="h-3.5 w-3.5 mr-1" /> Stop
                       </button>
                    ) : (
                       <button
                         onClick={() => handleSend()}
                         disabled={!inputValue.trim() || isSending}
                         className={cn(
                           "h-8 px-3 flex items-center justify-center rounded-[var(--radius)] transition-all duration-150",
                           inputValue.trim() 
                             ? "bg-foreground text-background hover:bg-foreground/90 shadow-sm" 
                             : "bg-surface-alt text-muted-foreground cursor-not-allowed border border-border"
                         )}
                       >
                          <span className="text-[10px] font-bold uppercase tracking-wider mr-1">Transmit</span>
                          <Send className="h-3 w-3" />
                       </button>
                    )}
                 </div>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                 <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                    <Command className="h-2.5 w-2.5" /> Transmit <span className="text-foreground">Enter</span>
                 </div>
                 <div className="h-1 w-1 rounded-full bg-border" />
                 <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                    <span className="text-foreground">Shift + Enter</span> newline
                 </div>
              </div>
           </div>
        </footer>
      </main>
    </div>
  )
}

function ActionBadge({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex items-center gap-1 px-2.5 py-1 bg-surface-alt border border-border rounded-[var(--radius)] transition-all active:scale-95 hover:border-border-strong hover:bg-surface group">
       <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
       <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </button>
  )
}
