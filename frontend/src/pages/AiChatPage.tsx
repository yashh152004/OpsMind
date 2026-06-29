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
    queryFn: async () => ({
      status: 'OPERATIONAL',
      shards: 12,
      latency: '240ms',
      version: '4.2.0-LTS'
    }),
    refetchInterval: 30000
  });

  // --- Mutations ---
  const createConvMutation = useMutation({
    mutationFn: (title: string) => apiClient.createConversation(title),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      setActiveConversationId(newConv.id);
      toast.success("New investigation shard initialized");
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

  const [streamingContent, setStreamingContent] = useState<string | null>(null);

  // --- Handlers ---
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const content = inputValue;
    setInputValue("");
    
    let convId = activeConversationId;
    
    if (!convId) {
      const newConv = await createConvMutation.mutateAsync(content.slice(0, 30) + "...");
      convId = newConv.id;
    }

    // Set temporary streaming state
    setStreamingContent("");
    
    try {
      let fullText = "";
      await apiClient.streamConversationMessage(convId!, content, (chunk) => {
        fullText += chunk;
        setStreamingContent(fullText);
      });
      // Once done, invalidate messages and clear streaming state
      setStreamingContent(null);
      queryClient.invalidateQueries({ queryKey: ['ai-messages', convId] });
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    } catch (error) {
      toast.error("Stream interrupted.");
      setStreamingContent(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setActiveConversationId(null);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendMessageMutation.isPending]);

  // Auto-expand textarea
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#F9F9F9] text-[#0B0B0B] font-geist selection:bg-black selection:text-white">
      {/* --- Left Inner: Reasoning History --- */}
      <aside className={cn(
        "w-80 border-r border-[#E5E5E5] bg-white flex flex-col transition-all duration-300",
        !isSidebarOpen && "w-0 overflow-hidden"
      )}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Reasoning_History</h2>
            <button 
              onClick={() => createConvMutation.mutate("New Investigation")}
              className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors"
              title="New Investigation (Ctrl+N)"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Filter shards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F5F5F5] border-none rounded-lg py-2.5 pl-10 pr-4 text-[13px] focus:ring-1 focus:ring-black transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
          {isHistoryLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-14 bg-neutral-50 rounded-lg animate-pulse mx-3" />
            ))
          ) : (
            filteredConversations?.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={cn(
                  "w-full group px-4 py-3.5 rounded-xl text-left transition-all duration-200 border border-transparent flex flex-col gap-1 relative",
                  activeConversationId === conv.id 
                    ? "bg-white border-[#E5E5E5] shadow-sm" 
                    : "hover:bg-neutral-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[13px] font-black uppercase tracking-tight truncate",
                    activeConversationId === conv.id ? "text-black" : "text-muted-foreground"
                  )}>
                    {conv.title}
                  </span>
                  {conv.pinned && <Pin className="h-3 w-3 text-black shrink-0" />}
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest italic">
                     {conv.updatedAt ? format(new Date(conv.updatedAt), 'MMM d, HH:mm') : 'SYNC_PENDING'}
                   </span>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); pinMutation.mutate(conv.id); }}
                        className={cn("p-1 transition-colors", conv.pinned ? "text-black" : "hover:text-black")}
                      >
                        <Pin className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const newTitle = prompt("Rename Shard", conv.title);
                          if (newTitle) renameMutation.mutate({ id: conv.id, title: newTitle });
                        }}
                        className="p-1 hover:text-black"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); archiveMutation.mutate(conv.id); }}
                        className="p-1 hover:text-black"
                      >
                        <Archive className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteConvMutation.mutate(conv.id); }}
                        className="p-1 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                   </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Engine Status Footnote */}
        <div className="p-6 border-t border-[#E5E5E5] bg-[#FAFAFA]">
           <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex-1">
                 <div className="text-[10px] font-black uppercase tracking-widest leading-none">OpsMind_Engine_v4</div>
                 <div className="text-[9px] text-muted-foreground mt-1 uppercase tracking-tighter">Latency: {engineStatus?.latency || '...'} | Shards: {engineStatus?.shards || '...'}</div>
              </div>
           </div>
        </div>
      </aside>

      {/* --- Main Chat Workspace --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Workspace Header */}
        <header className="h-16 border-b border-[#E5E5E5] px-8 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors lg:hidden"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              <div className="flex flex-col">
                 <h1 className="text-[14px] font-black uppercase tracking-widest">
                    {activeConversation ? activeConversation.title : 'NEW_INVESTIGATION'}
                 </h1>
                 <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
                    SECURE_ENDPOINT_SHARD_0x{activeConversationId?.slice(-8).toUpperCase() || 'UNINITIALIZED'}
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                 <div className="h-7 w-7 rounded-full border-2 border-white bg-black flex items-center justify-center text-[10px] text-white font-black">SRE</div>
                 <div className="h-7 w-7 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center text-[10px] text-black font-black">AI</div>
              </div>
              <div className="h-8 w-px bg-[#E5E5E5] mx-2" />
              <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
           </div>
        </header>

        {/* Message Stream */}
        <section className="flex-1 overflow-y-auto custom-scrollbar bg-white">
           <div className="max-w-4xl mx-auto px-8 py-12 space-y-12 min-h-full flex flex-col">
              {!activeConversationId && !messages?.length ? (
                /* Empty State */
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="h-20 w-20 bg-black flex items-center justify-center mask-hexagon">
                       <Sparkles className="h-10 w-10 text-white animate-pulse" />
                    </div>
                    <div className="space-y-3">
                       <h2 className="text-3xl font-black tracking-tight font-geist">OpsMind Intelligence Copilot</h2>
                       <p className="text-[#666] text-lg max-w-lg leading-relaxed">
                          Your enterprise SRE partner. Real-time context retrieval, predictive reasoning, and autonomous platform investigation.
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
                       {STARTER_PROMPTS.map((p) => (
                         <button
                           key={p.id}
                           onClick={() => { setInputValue(p.text); textareaRef.current?.focus(); }}
                           className="flex items-center gap-3 p-4 bg-white border border-strong rounded-xl hover:border-black hover:bg-neutral-50 transition-all text-left group"
                         >
                            <p.icon className="h-4 w-4 text-muted-foreground group-hover:text-black" />
                            <span className="text-[13px] font-bold text-neutral-700 group-hover:text-black">{p.text}</span>
                         </button>
                       ))}
                    </div>

                    <div className="pt-8 flex flex-col items-center gap-4">
                       <div className="flex items-center gap-6 px-8 py-3 bg-neutral-100 rounded-full">
                          <div className="flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Platform_Healthy</span>
                          </div>
                          <div className="h-3 w-px bg-neutral-300" />
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Latency: 42ms</span>
                          </div>
                       </div>
                       <p className="text-[10px] text-muted-foreground font-mono">ID: OPS-AI-82910-K8S-CTX</p>
                    </div>
                </div>
              ) : (
                /* Message List */
                <>
                  <AnimatePresence mode="popLayout">
                    {messages?.map((msg: any) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-6 p-1 group",
                          msg.role === 'ASSISTANT' ? "items-start" : "items-start"
                        )}
                      >
                         <div className={cn(
                           "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                           msg.role === 'USER' ? "bg-neutral-100 text-[#0B0B0B] border border-[#E5E5E5]" : "bg-black text-white"
                         )}>
                            {msg.role === 'USER' ? <UserIcon size={18} /> : <Sparkles size={18} />}
                         </div>
                         
                         <div className="flex-1 space-y-4 pt-1.5 min-w-0">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <span className="text-[12px] font-black uppercase tracking-widest">
                                     {msg.role === 'USER' ? 'SRE_OPERATOR' : 'OPSMIND_AI'}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground italic lowercase">
                                     {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm:ss') : '--:--'}
                                  </span>
                               </div>
                               <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                  <button className="p-1 hover:text-black transition-colors" title="Copy"><Copy className="h-3.5 w-3.5" /></button>
                                  {msg.role === 'ASSISTANT' && (
                                    <>
                                       <button className="p-1 hover:text-black transition-colors"><ThumbsUp className="h-3.5 w-3.5" /></button>
                                       <button className="p-1 hover:text-black transition-colors"><ThumbsDown className="h-3.5 w-3.5" /></button>
                                       <button className="p-1 hover:text-black transition-colors"><Download className="h-3.5 w-3.5" /></button>
                                    </>
                                  )}
                               </div>
                            </div>
                            
                            <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-[#0B0B0B]">
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                 {msg.content}
                               </ReactMarkdown>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                    {streamingContent !== null && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-6 p-1"
                      >
                         <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center shrink-0">
                            <Sparkles size={18} className="text-white animate-pulse" />
                         </div>
                         <div className="flex-1 space-y-4 pt-1.5">
                            <div className="flex items-center gap-3">
                               <span className="text-[12px] font-black uppercase tracking-widest">OPSMIND_AI</span>
                               <span className="text-[10px] text-emerald-600 font-black animate-pulse uppercase tracking-[0.2em]">Contextualizing_Reality...</span>
                            </div>
                            <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed text-[#0B0B0B]">
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                 {streamingContent || "..."}
                               </ReactMarkdown>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} className="h-4" />
                </>
              )}
           </div>
        </section>

        {/* --- DOCKED MESSAGE COMPOSER --- */}
        <footer className="shrink-0 border-t border-[#E5E5E5] bg-white p-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
           <div className="max-w-4xl mx-auto space-y-4">
              {/* Quick Actions Bar */}
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <ActionBadge icon={Paperclip} label="Log" />
                    <ActionBadge icon={ImageIcon} label="Capture" />
                    <ActionBadge icon={FileJson} label="JSON" />
                    <ActionBadge icon={FileText} label="Schema" />
                    <div className="w-px h-4 bg-[#E5E5E5] mx-2" />
                    <ActionBadge icon={Mic} label="Voice" />
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => { setInputValue(""); setActiveConversationId(null); }}
                      className="text-[11px] font-black uppercase tracking-widest text-[#999] hover:text-red-600 flex items-center gap-2 transition-colors"
                    >
                       <RefreshCcw className="h-3 w-3" /> Clear_Shard
                    </button>
                 </div>
              </div>

              {/* Input Workspace */}
              <div className={cn(
                "relative bg-[#F5F5F5] border border-transparent rounded-2xl transition-all duration-300",
                "focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10 focus-within:border-black",
                streamingContent !== null && "opacity-60 pointer-events-none"
              )}>
                 <textarea
                   ref={textareaRef}
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="Ask about an incident, infrastructure health, or root cause analysis..."
                   className="w-full bg-transparent border-none rounded-2xl py-5 pl-6 pr-24 text-[15px] font-medium leading-relaxed resize-none focus:ring-0 placeholder:text-neutral-400 placeholder:italic"
                   rows={1}
                 />
                 
                 <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    {streamingContent !== null ? (
                      <button 
                        className="h-10 px-4 bg-red-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2"
                      >
                         <StopCircle className="h-4 w-4" /> Stop
                      </button>
                    ) : (
                      <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className={cn(
                          "h-10 w-10 flex items-center justify-center rounded-xl transition-all",
                          inputValue.trim() 
                            ? "bg-black text-white shadow-lg shadow-black/20 scale-100" 
                            : "bg-neutral-200 text-neutral-400 scale-90 opacity-50"
                        )}
                      >
                         <Send className="h-4.5 w-4.5" />
                      </button>
                    )}
                 </div>
              </div>
              
              <div className="flex items-center justify-center gap-6">
                 <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    <Command className="h-3 w-3" /> <span className="underline">Enter</span> to send
                 </div>
                 <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    <span className="underline">Shift + Enter</span> for newline
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
