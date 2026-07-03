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
  Menu,
  Command,
  Plus,
  Clock
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { apiClient } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Search State
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

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
      setNotifications(data)
      setUnreadCount(data.length)
    } catch (e) {
      console.error("Failed to fetch notifications")
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setIsSearching(true)
        setShowResults(true)
        try {
          const data = await apiClient.globalSearch(query)
          setResults(data)
        } catch (e) {
          console.error("Search failed")
        } finally {
          setIsSearching(false)
        }
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [query])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

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
            <span className="text-foreground/40 group-hover:text-foreground transition-colors">prod-cluster</span>
            <span className="text-border">/</span>
            <span className="text-foreground font-semibold">us-east-1</span>
            <ChevronDown className="h-3.5 w-3.5 mt-0.5 opacity-40 group-hover:opacity-100" />
         </div>
         <div className="w-px h-3 bg-border hidden sm:block" />
         <div className="hidden sm:flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Systems Nominal</span>
         </div>
      </div>

      {/* Global Search Interface */}
      <div className="flex-1 max-w-lg mx-8 relative hidden md:block" ref={searchRef}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-foreground transition-colors">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface-alt/50 border border-border rounded-[var(--radius)] pl-10 pr-12 h-9 text-[13px] text-foreground placeholder:text-muted/60 transition-all focus:ring-2 focus:ring-foreground/5 focus:border-foreground-strong focus:bg-white outline-none"
            placeholder="Search across your infrastructure..."
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
             <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-border shadow-sm rounded text-[10px] font-bold text-muted uppercase tracking-tighter">
                <Command className="h-2.5 w-2.5" /> K
             </kbd>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
           <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-[var(--radius)] shadow-2xl z-[200] max-h-[480px] overflow-y-auto p-1.5 animate-in">
              <div className="px-3 py-1.5 mb-1">
                 <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Search Results</span>
              </div>
              {results.length > 0 ? (
                results.map((res, i) => (
                  <button key={i} 
                          onClick={() => {
                            setShowResults(false);
                            setQuery('');
                            const path = res.type === 'INCIDENT' ? '/incidents' : 
                                         res.type === 'ALERT' ? '/alerts' : 
                                         res.type === 'INFRASTRUCTURE' ? '/infrastructure' : 
                                         res.type === 'SECURITY' ? '/security' : '/settings';
                            navigate(path);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-surface-alt rounded-[var(--radius)] flex items-center gap-3 group transition-colors">
                    <div className="h-8 w-8 bg-surface-alt border border-border rounded-[var(--radius)] flex items-center justify-center text-muted group-hover:bg-foreground group-hover:text-white transition-all">
                      {res.type === 'INCIDENT' ? <AlertCircle className="h-4 w-4" /> : 
                       res.type === 'ALERT' ? <Bell className="h-4 w-4" /> : 
                       res.type === 'INFRASTRUCTURE' ? <Terminal className="h-4 w-4" /> : 
                       res.type === 'USER' ? <HelpCircle className="h-4 w-4" /> :
                       <Cpu className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">{res.title}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                         <span className="font-bold uppercase tracking-wider text-[10px]">{res.type}</span>
                         <span className="h-1 w-1 bg-border rounded-full" />
                         <span>{res.subtitle}</span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                   <Search className="h-8 w-8 text-muted/20 mx-auto mb-3" />
                   <p className="text-muted text-[12px] font-medium">No results found for "{query}"</p>
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
             <div className="absolute top-full right-0 mt-3 w-96 bg-surface border border-border rounded-[var(--radius)] shadow-2xl z-[300] flex flex-col animate-in">
                <div className="px-5 py-4 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                   <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground">Signals & Events</span>
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
                          <p className="text-[12px] text-muted leading-relaxed line-clamp-2">{n.message}</p>
                          <div className="mt-3 text-[10px] font-bold text-muted/40 uppercase tracking-widest flex items-center gap-2">
                             <Clock className="h-3 w-3" />
                             {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-16 text-center">
                        <Bell className="h-10 w-10 text-muted/10 mx-auto mb-4" />
                        <p className="text-[12px] font-bold uppercase tracking-widest text-muted/40">Quiet on the front</p>
                     </div>
                   )}
                </div>
                <button className="p-4 border-t border-border text-[11px] font-bold text-foreground hover:bg-surface-alt text-center uppercase tracking-[0.2em]" onClick={() => { setShowNotifications(false); navigate('/alerts'); }}>
                  View All Activity
                </button>
             </div>
           )}
        </div>
        
        <div className="flex items-center gap-3 pl-2 group cursor-pointer" onClick={() => navigate('/settings')}>
           <div className="hidden xl:block text-right">
              <div className="text-[13px] font-bold text-foreground leading-none">{user?.firstName} {user?.lastName}</div>
              <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mt-1">Enterprise</div>
           </div>
           <div className="relative">
              <div className="h-9 w-9 bg-foreground text-white rounded-[var(--radius)] flex items-center justify-center font-bold text-[14px] shadow-sm transform transition-transform group-hover:scale-105">
                 {user?.firstName?.[0] || 'Y'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-success border-2 border-white rounded-full shadow-sm" />
           </div>
           <ChevronDown className="h-4 w-4 text-muted/40 group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </header>
  )
}

export default Header
