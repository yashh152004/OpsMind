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
  Menu
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { apiClient } from '@/services/api'
import { useNavigate } from 'react-router-dom'

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
    <header className="h-14 border-b border-border bg-white flex items-center justify-between px-4 sticky top-0 z-[100]">
      {/* Mobile Toggle */}
      <button 
        onClick={onToggleSidebar}
        className="lg:hidden mr-4 text-muted hover:text-primary p-1.5 hover:bg-slate-50 rounded-sm transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Global Search Interface */}
      <div className="flex-1 max-w-xl relative hidden sm:block" ref={searchRef}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-muted group-focus-within:text-accent transition-colors">
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-border rounded-sm pl-9 pr-12 py-1.5 text-xs text-primary placeholder:text-muted/60 transition-all focus:ring-1 focus:ring-accent/20 focus:border-accent focus:bg-white outline-none"
            placeholder="Search resources, metrics, or logs... (Type '/' to search)"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none hidden md:flex">
             <kbd className="h-5 px-1.5 bg-white border border-border rounded-sm text-[10px] flex items-center gap-1 text-muted font-bold uppercase tracking-tighter">
                <span className="text-[8px]">⌘</span>K
             </kbd>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
           <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-sm shadow-xl z-[200] max-h-96 overflow-y-auto p-1 animate-in fade-in slide-in-from-top-1 duration-200">
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
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-sm flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 bg-slate-100 rounded flex items-center justify-center text-muted group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                        {res.type === 'INCIDENT' ? <AlertCircle className="h-3 w-3" /> : 
                         res.type === 'ALERT' ? <Bell className="h-3 w-3" /> : 
                         res.type === 'INFRASTRUCTURE' ? <Terminal className="h-3 w-3" /> : 
                         res.type === 'USER' ? <HelpCircle className="h-3 w-3" /> :
                         <Cpu className="h-3 w-3" />}
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-primary">{res.title}</div>
                        <div className="text-[10px] text-muted flex items-center gap-1.5 uppercase font-bold tracking-wider">
                           <span className="text-accent">{res.type}</span> • {res.subtitle}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                   <div className="text-muted/20 flex justify-center mb-2"><Search className="h-6 w-6" /></div>
                   <div className="text-muted text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                      No matching records<br/><span className="font-medium normal-case opacity-60">Try searching for service names, incident IDs, or cluster regions</span>
                   </div>
                </div>
              )}
           </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Environment Status Indicator */}
        <div className="hidden xl:flex items-center gap-3 px-3 h-7 bg-slate-50 border border-border rounded-sm text-[10px] font-bold uppercase tracking-widest text-muted">
           <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              US-EAST-1
           </span>
           <span className="w-px h-3 bg-border" />
           <span className="text-accent">Cluster OK</span>
        </div>

        <div className="flex items-center gap-1 relative" ref={notifRef}>
           <button 
             className="text-muted hover:text-primary transition-colors relative p-2 hover:bg-slate-50 rounded-sm" 
             onClick={() => setShowNotifications(!showNotifications)}>
             <Bell className="h-4.5 w-4.5" />
             {unreadCount > 0 && (
               <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-critical rounded-full border border-white animate-pulse" />
             )}
           </button>

           {showNotifications && (
             <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-border rounded-sm shadow-2xl z-[300] flex flex-col animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-4 py-2.5 border-b border-border bg-slate-50 flex items-center justify-between">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-primary">System Notifications</span>
                   <button onClick={handleMarkAllRead} className="text-[9px] font-bold text-accent hover:underline uppercase tracking-wider">Clear All</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                   {notifications.length > 0 ? (
                     notifications.map((n: any) => (
                       <div key={n.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" 
                            onClick={() => {
                              setShowNotifications(false);
                              navigate('/incidents'); // Default for now
                            }}>
                          <div className="flex justify-between items-start mb-1">
                             <div className="text-[11px] font-bold text-primary leading-tight">{n.title}</div>
                             <span className={cn("px-1 py-0.5 rounded-sm text-[8px] font-bold uppercase", 
                               n.severity === 'CRITICAL' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600")}>
                               {n.severity}
                             </span>
                          </div>
                          <div className="text-[10px] text-muted line-clamp-2 leading-normal">{n.message}</div>
                          <div className="mt-1.5 text-[8px] font-bold text-muted/40 uppercase tracking-tighter">
                             {new Date(n.timestamp).toLocaleTimeString()}
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-10 text-center text-muted text-[10px] font-bold uppercase tracking-widest opacity-40">No pending signals</div>
                   )}
                </div>
                <button className="p-2 border-t border-border text-[9px] font-bold text-primary hover:bg-slate-50 text-center uppercase tracking-widest" onClick={() => { setShowNotifications(false); navigate('/alerts'); }}>
                  View All Signals
                </button>
             </div>
           )}

           <button className="text-muted hover:text-primary transition-colors hidden sm:block p-2 hover:bg-slate-50 rounded-sm">
             <HelpCircle className="h-4.5 w-4.5" />
           </button>
        </div>
        
        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

        <div className="flex items-center gap-3 pl-1">
           <div className="hidden lg:block text-right">
             <div className="text-[12px] font-bold text-primary leading-tight">{user?.firstName} {user?.lastName}</div>
             <div className="text-[9px] text-accent font-bold uppercase tracking-widest">Enterprise Tier</div>
           </div>
           <button className="flex items-center gap-2 group h-8 w-8 bg-primary rounded-sm items-center justify-center text-white font-bold text-[11px] shadow-sm hover:bg-secondary transition-colors">
              {user?.firstName?.[0] || 'U'}
           </button>
        </div>
      </div>
    </header>
  )
}



export default Header
