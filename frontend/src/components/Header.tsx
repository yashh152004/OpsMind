import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  Loader2, 
  AlertCircle, 
  Terminal, 
  Cpu,
  Activity,
  Plus,
  ArrowRight,
  Settings,
  ShieldCheck,
  Clock,
  Menu,
  Command
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { apiClient } from '@/services/api'
import { searchService, SearchResult } from '@/services/SearchService'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Search Hub State
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Notification State
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.getNotifications()
      setNotifications(data || [])
      setUnreadCount(data?.length || 0)
    } catch (e) {
      console.error("Failed to fetch notifications")
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      // Escape to close
      if (e.key === 'Escape') {
        setShowResults(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const search = async () => {
      if (query.length > 0) {
        setIsSearching(true)
        setShowResults(true)
        const data = await searchService.search(query)
        setResults(data)
        setIsSearching(false)
      } else {
        setResults([])
        setShowResults(false)
      }
    }

    const debounce = setTimeout(search, 200)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter') {
       if (activeIndex >= 0) {
          e.preventDefault()
          handleNavigate(results[activeIndex])
       }
    }
  }

  const handleNavigate = (res: SearchResult) => {
    setShowResults(false)
    setQuery('')
    navigate(res.href)
  }

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead()
      setUnreadCount(0)
      setNotifications([])
      setShowNotifications(false)
    } catch (e) {
      console.error("Failed to mark all read")
    }
  }

  return (
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-6 sticky top-0 z-[100] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Mobile Toggle */}
      <button 
        onClick={onToggleSidebar}
        className="lg:hidden mr-4 text-muted hover:text-foreground p-2 hover:bg-surface-alt rounded-[var(--radius)] transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs / Context HUD */}
      <div className="flex items-center gap-4 text-[13px] font-medium text-muted">
         <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors group">
            <span className="text-secondary group-hover:text-foreground transition-colors">prod-cluster</span>
            <span className="text-border-strong">/</span>
            <span className="text-foreground font-black">us-east-1</span>
            <ChevronDown className="h-3.5 w-3.5 mt-0.5 text-muted group-hover:text-foreground" />
         </div>
         <div className="w-px h-3 bg-border hidden sm:block" />
         <div className="hidden sm:flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-success">Systems Nominal</span>
         </div>
      </div>

      {/* Global Search Interface */}
      <div className="flex-1 max-w-lg mx-8 relative hidden md:block" ref={searchRef}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted group-focus-within:text-foreground transition-colors">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => query.length > 0 && setShowResults(true)}
            className="w-full bg-surface-alt border border-border-strong rounded-[var(--radius)] pl-10 pr-12 h-10 text-[13px] font-bold text-foreground placeholder:text-muted outline-none transition-all focus:ring-2 focus:ring-foreground/10 focus:border-foreground"
            placeholder="Search resources, incidents, or commands..."
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
             <kbd className="flex items-center gap-0.5 px-2 py-0.5 bg-white border border-border-strong shadow-sm rounded text-[10px] font-black text-foreground uppercase tracking-tighter">
                CMD K
             </kbd>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border-strong rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[200] max-h-[500px] overflow-y-auto p-2 animate-in slide-in-from-top-2 duration-200">
               <div className="px-3 py-2 mb-1 flex items-center justify-between border-b border-border">
                  <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Platform Command Shard</span>
                  <span className="text-[10px] font-bold text-muted bg-surface-alt px-1.5 py-0.5 rounded border border-border">{results.length} Results</span>
               </div>
               
               {results.length > 0 ? (
                 <div className="space-y-0.5">
                   {results.map((res, i) => (
                    <button 
                      key={res.id} 
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => handleNavigate(res)}
                      className={cn(
                        "w-full text-left px-3 py-3 rounded-md flex items-center gap-4 group transition-all border border-transparent",
                        activeIndex === i ? "bg-black text-white shadow-lg translate-x-1" : "hover:bg-surface-alt"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded flex items-center justify-center transition-colors border",
                        activeIndex === i ? "bg-white/10 border-white/20 text-white" : "bg-surface-alt border-border text-muted"
                      )}>
                        {res.type === 'INCIDENT' ? <AlertCircle className="h-4 w-4" /> : 
                         res.type === 'ALERT' ? <Activity className="h-4 w-4" /> : 
                         res.type === 'INFRASTRUCTURE' ? <Terminal className="h-4 w-4" /> : 
                         res.type === 'SECURITY' ? <ShieldCheck className="h-4 w-4" /> :
                         res.type === 'SETTING' ? <Settings className="h-4 w-4" /> :
                         <Cpu className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-[13px] font-bold truncate", activeIndex === i ? "text-white" : "text-foreground")}>
                          {res.title}
                        </div>
                        <div className={cn("text-[11px] truncate flex items-center gap-2 mt-0.5 font-medium", activeIndex === i ? "text-white/60" : "text-muted")}>
                           <span className="font-black uppercase tracking-widest text-[9px] px-1 bg-neutral-800 text-white rounded-[2px]">{res.type}</span>
                           <span>{res.subtitle}</span>
                        </div>
                      </div>
                      {activeIndex === i && (
                         <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded border border-white/20 text-[10px] font-black uppercase">
                            Jump <ArrowRight className="h-3 w-3" />
                         </div>
                      )}
                    </button>
                   ))}
                 </div>
               ) : (
                 <div className="py-12 text-center">
                    <Search className="h-10 w-10 text-border-strong mx-auto mb-4 opacity-20" />
                    <p className="text-foreground font-black text-[14px] mb-1 uppercase tracking-tight">Access Signal Denied</p>
                    <p className="text-muted text-[11px] font-bold uppercase tracking-widest">No matching resources found in global cache</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                       {['Incidents', 'Security', 'Infra', 'Settings'].map(t => (
                          <button key={t} onClick={() => { setQuery(t); inputRef.current?.focus(); }} className="px-3 py-1 bg-surface-alt border border-border rounded text-[10px] font-bold text-muted hover:border-foreground hover:text-foreground transition-all">
                             {t}
                          </button>
                       ))}
                    </div>
                 </div>
               )}
            </div>
         )}
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Quick Action Button */}
        <button className="hidden sm:flex items-center gap-2 px-3 h-9 bg-foreground text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-foreground/90 transition-all shadow-sm">
           <Plus className="h-4 w-4" />
           <span>Quick Action</span>
        </button>

        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

        <div className="flex items-center gap-1.5 relative" ref={notifRef}>
           <button 
             className="text-muted hover:text-foreground transition-colors relative p-2.5 hover:bg-surface-alt rounded-[var(--radius)]" 
             onClick={() => setShowNotifications(!showNotifications)}>
             <Bell className="h-5 w-5" />
             {unreadCount > 0 && (
               <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-critical rounded-full border-2 border-white" />
             )}
           </button>

           {showNotifications && (
             <div className="absolute top-full right-0 mt-3 w-96 bg-surface border border-border rounded-[var(--radius)] shadow-2xl z-[300] flex flex-col animate-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                   <span className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground">Signals & Events</span>
                   <button onClick={handleMarkAllRead} className="text-[11px] font-bold text-foreground hover:underline">Clear All</button>
                </div>
                <div className="max-h-[480px] overflow-y-auto no-scrollbar">
                   {notifications.length > 0 ? (
                     notifications.map((n: any) => (
                       <div key={n.id} className="p-5 border-b border-border/50 hover:bg-surface-hover transition-colors cursor-pointer" 
                            onClick={() => {
                               setShowNotifications(false);
                               navigate('/incidents');
                            }}>
                          <div className="flex justify-between items-start mb-2">
                             <div className="text-[13px] font-bold text-foreground leading-tight pr-4">{n.title}</div>
                             <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", 
                                n.severity === 'CRITICAL' ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100")}>
                               {n.severity}
                             </span>
                          </div>
                          <p className="text-[12px] text-muted-foreground font-medium leading-relaxed line-clamp-2">{n.message}</p>
                          <div className="mt-3 text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                             <Clock className="h-3 w-3" />
                             {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-16 text-center">
                        <Bell className="h-10 w-10 text-muted/10 mx-auto mb-4" />
                        <p className="text-[12px] font-black uppercase tracking-widest text-secondary">Quiet on the front</p>
                     </div>
                   )}
                </div>
                <button className="p-4 border-t border-border text-[11px] font-black text-foreground hover:bg-surface-alt text-center uppercase tracking-[0.2em]" onClick={() => { setShowNotifications(false); navigate('/alerts'); }}>
                  View All Activity
                </button>
             </div>
           )}
        </div>
        
        <div className="flex items-center gap-3 pl-2 group cursor-pointer" onClick={() => navigate('/settings')}>
           <div className="hidden xl:block text-right">
              <div className="text-[13px] font-black text-foreground leading-none">{user?.firstName} {user?.lastName}</div>
              <div className="text-[11px] font-bold text-muted uppercase tracking-wider mt-1">Enterprise Shard</div>
           </div>
           <div className="relative">
              <div className="h-9 w-9 bg-foreground text-white rounded-[var(--radius)] flex items-center justify-center font-black text-[14px] shadow-sm transform transition-all group-hover:ring-2 group-hover:ring-foreground/20">
                 {user?.firstName?.[0] || 'Y'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-success border-2 border-white rounded-full shadow-sm" />
           </div>
           <ChevronDown className="h-4 w-4 text-secondary group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </header>
  )
}

export default Header
