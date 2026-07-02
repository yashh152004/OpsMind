import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Plus, MessageSquare, Pin, Archive, Trash2, Edit3, 
  Send, Search, MoreVertical, CheckCircle2, AlertTriangle, 
  Cpu, Globe, Share2, StopCircle, Copy, ThumbsUp, 
  ThumbsDown, Download, Paperclip, Image as ImageIcon, 
  FileJson, FileText, Mic, RefreshCcw, Command, 
  History, Sparkles, ChevronRight, CornerDownLeft, X,
  Terminal, Shield, Activity
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

interface Conversation {
  id: string | number;
  title: string;
  updatedAt: string;
  pinned: boolean;
  archived: boolean;
  messageCount?: number;
}

const STARTER_PROMPTS = [
  { id: 'p1', text: 'Investigate the latest incident', icon: AlertTriangle },
  { id: 'p2', text: 'Show unhealthy infrastructure', icon: Cpu },
  { id: 'p3', text: 'Summarize today\'s alerts', icon: BellIcon },
  { id: 'p4', text: 'Analyze Kubernetes cluster', icon: Globe },
  { id: 'p5', text: 'Generate RCA report', icon: FileText },
];

function BellIcon(props: any) {
  return <Activity {...props} />;
}

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
      toast.success("Investigation shard initialized");
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ convId, content }: { convId: string; content: string }) => 
      apiClient.sendConversationMessage(convId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
    onError: () => toast.error("Transmission failed. Signal lost.")
  });

  const deleteConvMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      if (activeConversationId) setActiveConversationId(null);
      toast.info("Investigation shard decommissioned");
    }
  });

  const pinMutation = useMutation({
    mutationFn: (id: string) => apiClient.togglePinConversation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiClient.archiveConversation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string, title: string }) => apiClient.renameConversation(id, title),
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
        const newConv = await createConvMutation.mutateAsync(finalContent.slice(0, 30) + "...");
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
      console.error("AI_PIPELINE_ERROR:", error);
      toast.error(error.response?.data?.message || "Signal lost. Attempting to reconnect...");
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-[#E9ECEF] flex flex-col transition-all duration-300 shadow-sm z-20",
        isSidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <div className="p-6 pb-2">
           <button 
             onClick={() => createConvMutation.mutate("New Investigation")}
             className="w-full flex items-center justify-between px-4 py-3 bg-black text-white rounded-xl font-bold text-sm tracking-tight hover:bg-neutral-800 transition-all shadow-lg shadow-black/10 group"
           >
             <div className="flex items-center gap-2">
               <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
               <span>New Investigation</span>
             </div>
             <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-mono">
                <Command className="h-3 w-3" /> N
             </div>
           </button>
        </div>

        <div className="p-4 px-6 space-y-4">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 group-focus-within:text-black transition-colors" />
              <input 
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F1F3F5] border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-black/5 focus:bg-white transition-all placeholder:text-neutral-400"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
           <div className="space-y-1">
              {isHistoryLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-16 bg-neutral-50 rounded-xl animate-pulse mx-2" />
                ))
              ) : (
                filteredConversations?.map((conv: any) => (
                  <div key={conv.id} className="group relative">
                    <button
                      onClick={() => setActiveConversationId(conv.id)}
                      className={cn(
                        "w-full px-4 py-4 rounded-xl text-left transition-all duration-200 flex flex-col gap-1.5 border border-transparent",
                        activeConversationId === conv.id 
                          ? "bg-white border-[#E9ECEF] shadow-md ring-1 ring-black/5" 
                          : "hover:bg-white hover:border-[#E9ECEF] hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-sm font-bold tracking-tight truncate max-w-[180px]",
                          activeConversationId === conv.id ? "text-black" : "text-neutral-600"
                        )}>
                          {conv.title}
                        </span>
                        {conv.pinned && <Pin className="h-3 w-3 text-black fill-black" />}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                         <span>{conv.updatedAt ? format(new Date(conv.updatedAt), 'MMM d, HH:mm') : 'Draft'}</span>
                         <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); pinMutation.mutate(conv.id); }} className="hover:text-black"><Pin className="h-3.5 w-3.5" /></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteConvMutation.mutate(conv.id); }} className="hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                         </div>
                      </div>
                    </button>
                  </div>
                ))
              )}
           </div>
        </div>

        <div className="p-4 bg-[#F8F9FA] border-t border-[#E9ECEF]">
           <div className="flex items-center gap-3 px-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="flex-1">
                 <div className="text-[10px] font-bold text-black uppercase tracking-widest leading-none">Security_Shard_v4</div>
                 <div className="text-[9px] text-neutral-500 mt-1.5 font-medium">Latency: {engineStatus?.latency || '342ms'} | Engine: Operational</div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative shadow-2xl z-10">
        <header className="h-16 border-b border-[#E9ECEF] px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 hover:bg-[#F1F3F5] rounded-xl transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-neutral-600" />
              </button>
              <div className="flex flex-col">
                 <h1 className="text-sm font-black uppercase tracking-widest text-black">
                    {activeConversation ? activeConversation.title : 'NEW_INVESTIGATION'}
                 </h1>
                 <div className="text-[9px] font-bold text-neutral-400 flex items-center gap-1.5 uppercase tracking-widest">
                    <Terminal className="h-2.5 w-2.5" /> SHARD_0x{activeConversationId?.toString().slice(-8).toUpperCase() || 'UNSYNCED'}
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-[#F1F3F5] px-3 py-1.5 rounded-full border border-[#E9ECEF]">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Real-time Stream</span>
              </div>
              <button className="p-2 hover:bg-[#F1F3F5] rounded-full transition-colors text-neutral-500 hover:text-black">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-[#F1F3F5] rounded-full transition-colors text-neutral-500 hover:text-black">
                <MoreVertical className="h-4 w-4" />
              </button>
           </div>
        </header>

        <section className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
           <div className="max-w-4xl mx-auto px-6 py-12 space-y-10 min-h-full">
              {!activeConversationId && !messages?.length ? (
                <div className="flex-1 flex flex-col items-center justify-center pt-20 text-center space-y-10">
                    <div className="relative">
                       <div className="absolute inset-0 bg-black blur-3xl opacity-10 animate-pulse" />
                       <div className="h-24 w-24 bg-black rounded-[2.5rem] flex items-center justify-center relative shadow-2xl ring-4 ring-black/5">
                          <Sparkles className="h-12 w-12 text-white" />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-4xl font-black tracking-tight text-black">SRE Intelligence Copilot</h2>
                       <p className="text-neutral-500 text-lg max-w-lg font-medium leading-relaxed">
                          Enterprise-grade reasoning for the modern observability stack. Investigate incidents, analyze infrastructure, and predict failures.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                       {STARTER_PROMPTS.map((p) => (
                         <button
                           key={p.id}
                           onClick={() => handleSend(p.text)}
                           className="flex items-center gap-4 p-5 bg-white border border-[#E9ECEF] rounded-2xl hover:border-black hover:shadow-xl hover:shadow-black/5 transition-all text-left group animate-in fade-in slide-in-from-bottom-4 duration-500"
                         >
                            <div className="h-10 w-10 bg-[#F1F3F5] rounded-xl flex items-center justify-center group-hover:bg-black transition-colors">
                               <p.icon className="h-5 w-5 text-neutral-600 group-hover:text-white" />
                            </div>
                            <div className="flex-1">
                               <span className="block text-sm font-bold text-black">{p.text}</span>
                               <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Execute Query</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                         </button>
                       ))}
                    </div>
                </div>
              ) : (
                <div className="space-y-10">
                   {messages?.map((msg: any) => (
                     <motion.div
                       key={msg.id}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="group flex flex-col gap-3"
                     >
                        <div className="flex items-center gap-3 px-1">
                           <div className={cn(
                             "h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black tracking-tighter",
                             msg.role === 'USER' ? "bg-black text-white" : "bg-[#F1F3F5] text-black"
                           )}>
                              {msg.role === 'USER' ? 'SRE' : 'AI'}
                           </div>
                           <span className="text-[11px] font-black uppercase tracking-widest text-[#999]">
                              {msg.role === 'USER' ? 'Operator' : 'OpsMind Core'}
                           </span>
                           <span className="text-[10px] text-neutral-400 font-medium">
                              {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm:ss') : '--:--:--'}
                           </span>
                        </div>
                        
                        <div className={cn(
                          "relative p-6 rounded-3xl text-[15px] leading-relaxed border transition-all",
                          msg.role === 'USER' 
                            ? "bg-[#F8F9FA] border-[#E9ECEF] text-black ml-10 shadow-sm" 
                            : "bg-white border-[#E9ECEF] mr-10 shadow-md group-hover:shadow-lg"
                        )}>
                           <div className="prose prose-neutral max-w-none prose-sm sm:prose-base dark:prose-invert">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                           </div>
                           
                           {msg.role === 'ASSISTANT' && (
                             <div className="absolute -bottom-10 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                <button className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors" title="Copy"><Copy className="h-3.5 w-3.5" /></button>
                                <button className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"><ThumbsUp className="h-3.5 w-3.5" /></button>
                                <button className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"><ThumbsDown className="h-3.5 w-3.5" /></button>
                                <button className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"><RefreshCcw className="h-3.5 w-3.5" /></button>
                             </div>
                           )}
                        </div>
                     </motion.div>
                   ))}
                   
                   {streamingContent !== null && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 px-1">
                           <div className="h-6 w-6 rounded-lg bg-[#F1F3F5] flex items-center justify-center text-black">
                              <Sparkles size={12} className="animate-pulse" />
                           </div>
                           <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 animate-pulse">Reasoning_In_Progress...</span>
                        </div>
                        <div className="bg-white border border-[#E9ECEF] p-6 rounded-3xl mr-10 shadow-lg ring-2 ring-emerald-500/5">
                           <div className="prose prose-neutral max-w-none prose-sm sm:prose-base">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {streamingContent || "Initializing semantic mesh..."}
                              </ReactMarkdown>
                           </div>
                        </div>
                     </motion.div>
                   )}
                   <div ref={messagesEndRef} className="h-20" />
                </div>
              )}
           </div>
        </section>

        {/* Input Bar */}
        <footer className="p-6 bg-white border-t border-[#E9ECEF] z-30">
           <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <ActionBadge icon={Paperclip} label="Logs" />
                    <ActionBadge icon={Globe} label="Infra" />
                    <ActionBadge icon={Shield} label="Security" />
                    <ActionBadge icon={FileJson} label="JSON" />
                    <div className="h-4 w-px bg-[#E9ECEF] mx-2" />
                    <ActionBadge icon={Mic} label="Voice Analysis" />
                 </div>
                 <div className="flex items-center gap-6">
                    <button 
                      onClick={() => { setInputValue(""); setActiveConversationId(null); }}
                      className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-red-600 flex items-center gap-2 transition-colors"
                    >
                       <X className="h-3 w-3" /> Reset_Investigation
                    </button>
                    <div className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest hidden sm:block">
                       Engine: Standard_Reasoning
                    </div>
                 </div>
              </div>

              <div className={cn(
                "relative group bg-[#F8F9FA] rounded-[1.5rem] border-2 border-[#E9ECEF] transition-all duration-300",
                "focus-within:bg-white focus-within:border-black focus-within:shadow-2xl focus-within:shadow-black/5",
                streamingContent !== null && "opacity-50 pointer-events-none"
              )}>
                 <textarea
                   ref={textareaRef}
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="Ask anything about your platform's health..."
                   className="w-full bg-transparent border-none rounded-3xl py-5 pl-7 pr-24 text-[16px] font-medium leading-relaxed resize-none focus:ring-0 placeholder:text-neutral-400 placeholder:italic"
                   rows={1}
                 />
                 
                 <div className="absolute right-4 bottom-4">
                    {isSending || streamingContent !== null ? (
                      <div className="flex items-center gap-3">
                         <div className="flex gap-1">
                            <span className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1 h-1 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1 h-1 bg-black rounded-full animate-bounce" />
                         </div>
                         <button 
                           onClick={() => setStreamingContent(null)}
                           className="h-10 w-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                         >
                            <StopCircle className="h-5 w-5" />
                         </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isSending}
                        className={cn(
                          "h-12 w-12 flex items-center justify-center rounded-xl transition-all shadow-xl",
                          inputValue.trim() 
                            ? "bg-black text-white hover:scale-105 active:scale-95 shadow-black/20" 
                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-50"
                        )}
                      >
                         <Send className="h-5 w-5" />
                      </button>
                    )}
                 </div>
              </div>
              
              <div className="flex items-center justify-center gap-6">
                 <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                    <Command className="h-3 w-3" /> <span className="text-black">Enter</span> to transmit
                 </div>
                 <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                    <span className="text-black">Shift + Enter</span> for newline
                 </div>
              </div>
           </div>
        </footer>
      </main>
    </div>
  )
}

// --- Sub-components ---

function ActionBadge({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-neutral-100 border border-strong rounded-lg transition-all transform active:scale-95">
       <Icon className="h-3.5 w-3.5 text-neutral-600" />
       <span className="text-[11px] font-black uppercase tracking-tighter text-neutral-700">{label}</span>
    </button>
  );
}

function UserIcon({ size }: { size: number }) {
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="h-full w-full bg-[#0B0B0B] text-white flex items-center justify-center text-[10px] font-black rounded-lg">
        SRE
      </div>
    </div>
  );
}
