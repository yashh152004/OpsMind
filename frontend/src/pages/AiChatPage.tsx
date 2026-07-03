import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, MessageSquare, Pin, Archive, Trash2, Edit3, 
  Send, Search, MoreVertical, CheckCircle2, AlertTriangle, 
  Cpu, Globe, Share2, StopCircle, Copy, ThumbsUp, 
  ThumbsDown, Download, Paperclip, Image as ImageIcon, 
  FileJson, FileText, Mic, RefreshCcw, Command, 
  History, Sparkles, ChevronRight, CornerDownLeft, X,
  Terminal, Shield, Activity, Bell, Zap, Clock, Info, SlidersHorizontal
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'
import { apiClient } from '@/services/api'
import { toast } from 'sonner'

// --- Types ---
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
];

export default function AiChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Queries ---
  const { data: conversations, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => apiClient.getConversations()
  });

  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['ai-messages', activeConversationId],
    queryFn: () => activeConversationId ? apiClient.getConversationMessages(activeConversationId) : Promise.resolve([]),
    enabled: !!activeConversationId
  });

  const { data: engineStatus } = useQuery({
    queryKey: ['ai-status'],
    queryFn: async () => apiClient.health(),
    refetchInterval: 30000
  });

  // --- Mutations ---
  const createConvMutation = useMutation({
    mutationFn: (title: string) => apiClient.createConversation(title),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      setActiveConversationId(newConv.id);
      toast.success("Investigation shard initialized.");
    }
  });

  const deleteConvMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      if (activeConversationId) setActiveConversationId(null);
      toast.info("Investigation decommissioned.");
    }
  });

  const pinMutation = useMutation({
    mutationFn: (id: string) => apiClient.togglePinConversation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
  });

  const [isSending, setIsSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);

  const handleSend = async (contentOverride?: string) => {
    const finalContent = contentOverride || inputValue.trim();
    if (!finalContent || isSending) return;
    
    setIsSending(true);
    setInputValue("");
    
    let convId = activeConversationId;
    
    try {
      if (!convId) {
        const newConv = await createConvMutation.mutateAsync("Active Investigation");
        convId = newConv.id;
        setActiveConversationId(convId);
      }

      setStreamingContent("");
      
      let fullText = "";
      await apiClient.streamConversationMessage(convId!.toString(), finalContent, (chunk) => {
        fullText += chunk;
        setStreamingContent(fullText);
      });
      
      setStreamingContent(null);
      queryClient.invalidateQueries({ queryKey: ['ai-messages', convId] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    } catch (error: any) {
      toast.error("Transmission failure. Signal lost.");
      setStreamingContent(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
     if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
     }
  }, [inputValue]);

  const activeConversation = conversations?.find((c: any) => c.id === activeConversationId);
  const filteredConversations = conversations?.filter((c: any) => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Search & History Sidebar */}
      <aside className={cn(
        "bg-surface border-r border-border flex flex-col transition-all duration-300 z-20",
        isSidebarOpen ? "w-[300px]" : "w-0 overflow-hidden"
      )}>
        <div className="p-6 pb-2">
           <button 
             onClick={() => createConvMutation.mutate("New Investigation")}
             className="w-full btn-primary h-10 gap-2"
           >
              <Plus className="h-4 w-4" />
              <span>New Investigation</span>
           </button>
        </div>

        <div className="p-4 px-6">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted group-focus-within:text-foreground transition-colors" />
              <input 
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-enterprise pl-9 h-9 w-full"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 no-scrollbar">
           <div className="space-y-1">
              {isHistoryLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-14 skeleton-ui mx-2 rounded-lg opacity-40" />
                ))
              ) : (
                filteredConversations?.map((conv: any) => (
                  <div key={conv.id} className="group relative">
                    <button
                      onClick={() => setActiveConversationId(conv.id)}
                      className={cn(
                        "w-full px-3 py-3 rounded-lg text-left transition-all duration-200 flex flex-col gap-1 border border-transparent",
                        activeConversationId === conv.id 
                          ? "bg-surface-alt border-border shadow-sm" 
                          : "hover:bg-surface-hover/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[13px] font-bold truncate max-w-[200px]",
                          activeConversationId === conv.id ? "text-foreground" : "text-muted"
                        )}>
                          {conv.title}
                        </span>
                        {conv.pinned && <Pin className="h-2.5 w-2.5 text-foreground fill-foreground" />}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted opacity-60">
                         <span>{conv.updatedAt ? format(new Date(conv.updatedAt), 'MMM d') : 'Draft'}</span>
                         <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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

        <div className="p-4 bg-surface-alt border-t border-border">
           <div className="flex items-center gap-3 px-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex-1 min-w-0">
                 <div className="text-[10px] font-bold text-foreground uppercase tracking-widest leading-none truncate">Engine: Standard_Reasoning_v4</div>
                 <div className="text-[9px] text-muted mt-1.5 font-semibold">Latency: {engineStatus?.latency || 'LOW'}</div>
              </div>
           </div>
        </div>
      </aside>

      {/* Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative z-10">
        <header className="h-14 border-b border-border px-8 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-30">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-1.5 hover:bg-surface-alt rounded-md transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4 text-muted" />
              </button>
              <div className="flex flex-col">
                 <h1 className="text-[12px] font-bold tracking-[0.1em] text-foreground uppercase">
                    {activeConversation ? activeConversation.title : 'Shard_Initiation'}
                 </h1>
                 <div className="text-[9px] font-bold text-muted flex items-center gap-1.5 uppercase tracking-[0.2em]">
                    <Terminal className="h-2.5 w-2.5" /> Logical_Loop: {activeConversationId ? `0x${activeConversationId.toString().slice(-4)}` : 'UNSYNCED'}
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-surface-alt px-2.5 py-1 rounded-md border border-border">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Secure Stream</span>
              </div>
              <button className="p-2 hover:bg-surface-alt rounded-md transition-colors text-muted hover:text-foreground">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-surface-alt rounded-md transition-colors text-muted hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
           </div>
        </header>

        <section className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
           <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 min-h-full flex flex-col">
              {!activeConversationId && !messages?.length ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
                    <div className="relative">
                       <div className="h-20 w-20 bg-foreground text-background rounded-2xl flex items-center justify-center relative shadow-2xl">
                          <Sparkles className="h-10 w-10" />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-3xl font-bold tracking-tight text-foreground">SRE Intelligence Command</h2>
                       <p className="text-muted text-[15px] max-w-lg font-medium leading-relaxed">
                          Enterprise-grade reasoning for the modern observability stack. Investigate incidents, analyze infrastructure, and predict failure vectors.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                       {STARTER_PROMPTS.map((p) => (
                         <button
                           key={p.id}
                           onClick={() => handleSend(p.text)}
                           className="flex items-start gap-4 p-5 bg-surface border border-border rounded-xl hover:border-foreground transition-all text-left group"
                         >
                            <div className="h-8 w-8 bg-surface-alt border border-border rounded-lg flex items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-background shrink-0 mt-0.5">
                               <p.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <span className="block text-[13px] font-bold text-foreground mb-0.5">{p.text}</span>
                               <span className="text-[10px] text-muted font-bold uppercase tracking-widest">{p.desc}</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5 text-border group-hover:text-foreground transition-all mt-1" />
                         </button>
                       ))}
                    </div>
                </div>
              ) : (
                <div className="space-y-12">
                   {messages?.map((msg: any) => (
                     <motion.div
                       key={msg.id}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="group flex flex-col gap-4"
                     >
                        <div className="flex items-center gap-3">
                           <div className={cn(
                             "h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold",
                             msg.role === 'USER' ? "bg-neutral-100 text-neutral-600 border border-neutral-200" : "bg-foreground text-background"
                           )}>
                              {msg.role === 'USER' ? 'SRE' : 'AI'}
                           </div>
                           <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/70">
                              {msg.role === 'USER' ? 'Operator Signal' : 'OpsMind Core Response'}
                           </span>
                           <span className="text-[10px] text-muted font-bold">
                              {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm:ss') : '--:--:--'}
                           </span>
                        </div>
                        
                        <div className={cn(
                          "relative p-6 rounded-2xl text-[15px] leading-relaxed border transition-all",
                          msg.role === 'USER' 
                            ? "bg-surface-alt border-border text-foreground ml-8" 
                            : "bg-surface border-border mr-8 shadow-sm"
                        )}>
                           <div className="prose prose-neutral max-w-none prose-sm sm:prose-base dark:prose-invert">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                           </div>
                           
                           {msg.role === 'ASSISTANT' && (
                             <div className="flex items-center justify-end gap-1 mt-4 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 hover:bg-surface-alt rounded-md transition-colors text-muted hover:text-foreground" title="Copy"><Copy className="h-3.5 w-3.5" /></button>
                                <button className="p-1.5 hover:bg-surface-alt rounded-md transition-colors text-muted hover:text-foreground"><ThumbsUp className="h-3.5 w-3.5" /></button>
                                <button className="p-1.5 hover:bg-surface-alt rounded-md transition-colors text-muted hover:text-foreground"><ThumbsDown className="h-3.5 w-3.5" /></button>
                                <button className="p-1.5 hover:bg-surface-alt rounded-md transition-colors text-muted hover:text-foreground"><RefreshCcw className="h-3.5 w-3.5" /></button>
                             </div>
                           )}
                        </div>
                     </motion.div>
                   ))}
                   
                   {streamingContent !== null && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                           <div className="h-6 w-6 rounded-md bg-foreground flex items-center justify-center text-background">
                              <Sparkles size={12} className="animate-pulse" />
                           </div>
                           <span className="text-[11px] font-bold uppercase tracking-widest text-foreground animate-pulse">Processing_Inference...</span>
                        </div>
                        <div className="bg-surface border border-border p-6 rounded-2xl mr-8 shadow-sm">
                           <div className="prose prose-neutral max-w-none prose-sm sm:prose-base">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {streamingContent || "Initializing semantic cross-linkage..."}
                              </ReactMarkdown>
                           </div>
                        </div>
                     </motion.div>
                   )}
                   <div ref={messagesEndRef} className="h-24" />
                </div>
              )}
           </div>
        </section>

        {/* Input Dock */}
        <footer className="p-6 bg-background border-t border-border z-30">
           <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <ActionBadge icon={Paperclip} label="Logs" />
                    <ActionBadge icon={Globe} label="Infra" />
                    <ActionBadge icon={Shield} label="Security" />
                    <ActionBadge icon={Zap} label="Agents" />
                 </div>
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => { setInputValue(""); setActiveConversationId(null); }}
                      className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-red-500 flex items-center gap-2 transition-colors"
                    >
                       <X className="h-3.5 w-3.5" /> Clear_Buffer
                    </button>
                    <span className="text-[10px] font-bold text-border uppercase tracking-widest hidden sm:block">
                       SLO: 99.9%
                    </span>
                 </div>
              </div>

              <div className={cn(
                "relative group bg-surface rounded-xl border border-border-strong transition-all duration-200",
                "focus-within:border-foreground focus-within:shadow-xl",
                streamingContent !== null && "opacity-50 pointer-events-none"
              )}>
                 <textarea
                   ref={textareaRef}
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="Consult OpsMind Core for telemetry reasoning..."
                   className="w-full bg-transparent border-none rounded-xl py-4 pl-6 pr-24 text-[15px] font-medium leading-relaxed resize-none focus:ring-0 placeholder:text-muted/50"
                   rows={1}
                 />
                 
                 <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    {isSending || streamingContent !== null ? (
                       <button 
                         onClick={() => setStreamingContent(null)}
                         className="h-10 px-4 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-[11px] font-bold uppercase tracking-widest"
                       >
                          <StopCircle className="h-4 w-4 mr-2" /> Stop
                       </button>
                    ) : (
                       <button
                         onClick={() => handleSend()}
                         disabled={!inputValue.trim() || isSending}
                         className={cn(
                           "h-10 px-4 flex items-center justify-center rounded-lg transition-all",
                           inputValue.trim() 
                             ? "bg-foreground text-background hover:opacity-90 shadow-md" 
                             : "bg-surface-alt text-muted cursor-not-allowed"
                         )}
                       >
                          <span className="text-[11px] font-bold uppercase tracking-wider mr-2">Transmit</span>
                          <Send className="h-3.5 w-3.5" />
                       </button>
                    )}
                 </div>
              </div>
              
              <div className="flex items-center justify-center gap-6">
                 <div className="flex items-center gap-2 text-[10px] text-muted font-bold uppercase tracking-widest">
                    <Command className="h-3 w-3" /> Transmit with <span className="text-foreground">Enter</span>
                 </div>
                 <div className="h-1 w-1 rounded-full bg-border" />
                 <div className="flex items-center gap-2 text-[10px] text-muted font-bold uppercase tracking-widest">
                    <span className="text-foreground">Shift + Enter</span> for newline
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
    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-alt border border-border rounded-lg transition-all active:scale-95 hover:border-foreground group">
       <Icon className="h-3.5 w-3.5 text-muted group-hover:text-foreground transition-colors" />
       <span className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">{label}</span>
    </button>
  );
}
