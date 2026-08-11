import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Bell, 
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
  Command,
  X
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
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 sticky top-0 z-[100] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Mobile Toggle */}
      <button 
        onClick={onToggleSidebar}
        className="lg:hidden mr-3 text-muted-foreground hover:text-foreground p-2 hover:bg-surface-hover rounded-[var(--radius)] transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs / Context HUD */}
      <div className="flex items-center gap-3 text-[13px] font-medium text-muted-foreground">
         <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors group">
            <span className="text-foreground/80 group-hover:text-foreground transition-colors">prod-cluster</span>
            <span className="text-border">/</span>
            <span className="text-foreground font-semibold">us-east-1</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
         </div>
         <div className="w-px h-3 bg-border hidden sm:block" />
         <div className="hidden sm:flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-success">Systems Nominal</span>
         </div>
      </div>

      {/* Global Search Interface */}
      <div className="flex-1 max-w-lg mx-6 relative hidden md:block" ref={searchRef}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => query.length > 0 && setShowResults(true)}
            className="w-full bg-surface-alt border border-border rounded-[var(--radius)] pl-9.5 pr-14 h-9 text-[14px] font-normal text-foreground placeholder:text-muted-foreground/75 outline-none transition-all duration-150 focus:ring-1 focus:ring-foreground/5 focus:border-border-strong"
            placeholder="Search resources, incidents, or commands..."
          />
          {query.length > 0 && (
            <button 
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute inset-y-0 right-10 px-2 flex items-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
             <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-secondary border border-border rounded text-[9px] font-medium text-muted uppercase">
                <Command className="h-2.5 w-2.5" /> K
             </kbd>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border-strong rounded-[var(--radius)] shadow-[0_12px_30px_rgba(0,0,0,0.12)] z-[200] max-h-[400px] overflow-y-auto p-1.5 animate-fade-in">
               <div className="px-2.5 py-1.5 mb-1 flex items-center justify-between border-b border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Platform Command Shard</span>
                  <span className="text-[10px] font-medium text-muted-foreground bg-surface-alt px-1.5 py-0.5 rounded border border-border">{results.length} Results</span>
               </div>
               
               {results.length > 0 ? (
                 <div className="space-y-0.5">
                    {results.map((res, i) => (
                     <button 
                       key={res.id} 
                       onMouseEnter={() => setActiveIndex(i)}
                       onClick={() => handleNavigate(res)}
                       className={cn(
                         "w-full text-left px-2.5 py-2 rounded-[var(--radius)] flex items-center gap-3 transition-colors text-foreground",
                         activeIndex === i ? "bg-secondary text-foreground" : ""
                       )}
                     >
                       <div className={cn(
                         "h-7 w-7 rounded flex items-center justify-center border",
                         activeIndex === i ? "bg-surface border-border-strong text-foreground" : "bg-surface-alt border-border text-muted-foreground"
                       )}>
                         {res.type === 'INCIDENT' ? <AlertCircle className="h-3.5 w-3.5" /> : 
                          res.type === 'ALERT' ? <Activity className="h-3.5 w-3.5" /> : 
                          res.type === 'INFRASTRUCTURE' ? <Terminal className="h-3.5 w-3.5" /> : 
                          res.type === 'SECURITY' ? <ShieldCheck className="h-3.5 w-3.5" /> :
                          res.type === 'SETTING' ? <Settings className="h-3.5 w-3.5" /> :
                          <Cpu className="h-3.5 w-3.5" />}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="text-[13px] font-medium truncate">
                           {res.title}
                         </div>
                         <div className="text-[11px] truncate flex items-center gap-1.5 mt-0.5 font-normal text-muted-foreground">
                            <span className="font-semibold uppercase tracking-wider text-[8px] px-1 bg-secondary text-foreground rounded-[2px]">{res.type}</span>
                            <span className="truncate">{res.subtitle}</span>
                         </div>
                       </div>
                       {activeIndex === i && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-surface rounded border border-border text-[9px] font-semibold uppercase text-muted-foreground mr-1">
                             Jump <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
                          </div>
                       )}
                     </button>
                    ))}
                 </div>
               ) : (
                 <div className="py-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-foreground font-semibold text-[13px] mb-0.5 uppercase tracking-wide">No resources located</p>
                    <p className="text-muted-foreground text-[11px] font-normal leading-normal px-4">No matching services, alerts, or configurations in cluster registry</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5 px-3">
                       {['Incidents', 'Security', 'Service Map', 'Settings'].map(t => (
                          <button key={t} onClick={() => { setQuery(t); inputRef.current?.focus(); }} className="px-2.5 py-1 bg-surface-alt border border-border rounded text-[10px] font-medium text-muted hover:border-border-strong hover:text-foreground transition-all">
                             {t}
                          </button>
                       ))}
                    </div>
                 </div>
               )}
            </div>
         )}
      </div>

      <div className="flex items-center gap-3.5 ml-auto">
        {/* Quick Action Button */}
        <button 
          onClick={() => navigate('/incidents')}
          className="hidden sm:flex items-center gap-1.5 btn-primary h-8.5 text-[13px] px-3"
        >
           <Plus className="h-4 w-4" />
           <span>Declare Incident</span>
        </button>

        <div className="h-5 w-px bg-border hidden sm:block" />

        {/* Signals Event Drawer Bell */}
        <div className="relative" ref={notifRef}>
           <button 
             className="text-muted-foreground hover:text-foreground transition-colors relative p-2 hover:bg-surface-hover rounded-[var(--radius)] flex items-center justify-center" 
             onClick={() => setShowNotifications(!showNotifications)}>
             <Bell className="h-4.5 w-4.5" />
             {unreadCount > 0 && (
               <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-critical rounded-full border border-surface shadow-xs" />
             )}
           </button>

           {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-96 bg-surface border border-border-strong rounded-[var(--radius)] shadow-[0_12px_30px_rgba(0,0,0,0.12)] z-[300] flex flex-col animate-fade-in">
                 <div className="px-4 py-3 border-b border-border bg-surface-alt/80 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Signals & Events</span>
                    <button onClick={handleMarkAllRead} className="text-[11px] font-semibold text-foreground hover:underline">Clear All</button>
                 </div>
                 <div className="max-h-[380px] overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n: any) => (
                        <div key={n.id} className="p-4 border-b border-border/80 hover:bg-surface-hover transition-colors cursor-pointer text-left" 
                             onClick={() => {
                                setShowNotifications(false);
                                navigate('/incidents');
                             }}>
                           <div className="flex justify-between items-start mb-1.5">
                              <div className="text-[13px] font-semibold text-foreground leading-tight pr-3 truncate max-w-[220px]">{n.title}</div>
                              <span className={cn("badge-enterprise", 
                                 n.severity === 'CRITICAL' ? "badge-critical" : "badge-info")}>
                                {n.severity}
                              </span>
                           </div>
                           <p className="text-[12px] text-muted-foreground font-normal leading-normal line-clamp-2">{n.message}</p>
                           <div className="mt-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                         <Bell className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                         <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">No active notifications</p>
                      </div>
                    )}
                 </div>
                 <button 
                  className="py-3 border-t border-border text-[11px] font-bold text-foreground bg-surface-alt/30 hover:bg-surface-hover text-center uppercase tracking-wider transition-colors"
                  onClick={() => { setShowNotifications(false); navigate('/alerts'); }}
                 >
                   View All Activity
                 </button>
              </div>
           )}
        </div>
        
        {/* User profile dropdown trigger */}
        <div className="flex items-center gap-2.5 pl-1.5 group cursor-pointer" onClick={() => navigate('/settings')}>
           <div className="hidden xl:block text-right select-none">
              <div className="text-[13px] font-semibold text-foreground leading-none">{user?.firstName} {user?.lastName}</div>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">Enterprise Shard</div>
           </div>
           <div className="relative">
              <div className="h-8 w-8 bg-secondary border border-border-strong/10 overflow-hidden rounded-[var(--radius)] flex items-center justify-center font-bold text-[13px] shadow-sm transform transition-all duration-150 group-hover:ring-1 group-hover:ring-foreground/20 select-none">
                 {user?.avatarUrl ? (
                   <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                 ) : (
                   <span>{user?.firstName?.[0] || 'Y'}</span>
                 )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-success border-2 border-surface rounded-full shadow-sm" />
           </div>
           <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors duration-150" />
        </div>
      </div>
    </header>
  )
}

export default Header
