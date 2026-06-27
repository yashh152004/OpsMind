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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-accent transition-colors">
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-border rounded-[2px] pl-10 pr-12 py-1.5 text-[12px] text-primary placeholder:text-muted/60 transition-all focus:ring-1 focus:ring-accent/10 focus:border-accent focus:bg-white outline-none"
            placeholder="Search resources, metrics, or logs... (⌘K)"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none hidden md:flex">
             <kbd className="h-4 px-1.5 bg-white border border-border rounded-[2px] text-[9px] flex items-center gap-0.5 text-muted font-bold uppercase tracking-tighter">
                <span>⌘</span>K
             </kbd>
          </div>
        </div>

        {/* Search Results Dropdown remains same but styled more minimally */}
        {showResults && (
           <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-[2px] shadow-2xl z-[200] max-h-96 overflow-y-auto p-1">
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
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-[2px] flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 bg-slate-50 border border-border rounded-[2px] flex items-center justify-center text-muted group-hover:bg-accent group-hover:text-white transition-all">
                        {res.type === 'INCIDENT' ? <AlertCircle className="h-3.5 w-3.5" /> : 
                         res.type === 'ALERT' ? <Bell className="h-3.5 w-3.5" /> : 
                         res.type === 'INFRASTRUCTURE' ? <Terminal className="h-3.5 w-3.5" /> : 
                         res.type === 'USER' ? <HelpCircle className="h-3.5 w-3.5" /> :
                         <Cpu className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-primary">{res.title}</div>
                        <div className="text-[9px] text-muted flex items-center gap-1.5 uppercase font-black tracking-widest mt-0.5">
                           <span className="text-accent">{res.type}</span> • {res.subtitle}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                   <div className="text-muted/10 flex justify-center mb-2"><Search className="h-8 w-8" /></div>
                   <div className="text-muted text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                      No matching records
                   </div>
                </div>
              )}
           </div>
        )}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Resource Selection HUD */}
        <div className="hidden xl:flex items-center gap-4 px-3 h-8 bg-slate-50 border border-border rounded-[2px]">
           <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group">
              <div className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary transition-colors pr-1">us-east-1</span>
              <ChevronDown className="h-3 w-3 text-muted/40" />
           </div>
           <div className="w-px h-3.5 bg-border" />
           <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors group">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-primary transition-colors">Cluster OK</span>
              <ChevronDown className="h-3 w-3 text-muted/40" />
           </div>
        </div>

        <div className="flex items-center gap-1 relative" ref={notifRef}>
           <button 
             className="text-muted hover:text-primary transition-colors relative p-2 hover:bg-slate-50 rounded-[2px]" 
             onClick={() => setShowNotifications(!showNotifications)}>
             <Bell className="h-4.5 w-4.5" />
             {unreadCount > 0 && (
               <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-critical rounded-full border border-white" />
             )}
           </button>

           {showNotifications && (
             <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-border rounded-[2px] shadow-2xl z-[300] flex flex-col">
                <div className="px-4 py-3 border-b border-border bg-slate-50/50 flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Signals</span>
                   <button onClick={handleMarkAllRead} className="text-[9px] font-bold text-accent hover:underline uppercase tracking-widest">Mark All Read</button>
                </div>
                <div className="max-h-[400px] overflow-y-auto scrollbar-slim">
                   {notifications.length > 0 ? (
                     notifications.map((n: any) => (
                       <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" 
                            onClick={() => {
                               setShowNotifications(false);
                               navigate('/incidents');
                            }}>
                          <div className="flex justify-between items-start mb-1.5">
                             <div className="text-[12px] font-bold text-primary leading-tight">{n.title}</div>
                             <span className={cn("px-1.5 py-0.5 rounded-[1px] text-[8px] font-black uppercase tracking-tighter", 
                               n.severity === 'CRITICAL' ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100")}>
                               {n.severity}
                             </span>
                          </div>
                          <div className="text-[11px] text-secondary line-clamp-2 leading-relaxed">{n.message}</div>
                          <div className="mt-2 text-[9px] font-bold text-muted/50 uppercase tracking-widest">
                             {new Date(n.timestamp).toLocaleTimeString()}
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-12 text-center">
                        <div className="text-muted/10 flex justify-center mb-3"><Bell className="h-10 w-10" /></div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/40">No pending signals</div>
                     </div>
                   )}
                </div>
                <button className="p-3 border-t border-border text-[10px] font-black text-primary hover:bg-slate-50 text-center uppercase tracking-[0.2em]" onClick={() => { setShowNotifications(false); navigate('/alerts'); }}>
                  Analyze All Activity
                </button>
             </div>
           )}

           <button className="text-muted hover:text-primary transition-colors hidden sm:block p-2 hover:bg-slate-50 rounded-[2px]">
             <HelpCircle className="h-4.5 w-4.5" />
           </button>
        </div>
        
        <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

        <div className="flex items-center gap-3 pl-1 group cursor-pointer">
           <div className="hidden lg:block text-right">
             <div className="text-[12px] font-bold text-primary leading-tight group-hover:text-accent transition-colors">{user?.firstName} {user?.lastName}</div>
             <div className="text-[9px] text-muted font-bold uppercase tracking-widest leading-none mt-0.5">Enterprise Tier</div>
           </div>
           <div className="relative">
              <div className="h-8 w-8 bg-primary rounded-[2px] flex items-center justify-center text-white font-bold text-[13px] shadow-sm group-hover:bg-accent transition-colors">
                 {user?.firstName?.[0] || 'Y'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-success border-2 border-white rounded-full" />
           </div>
           <ChevronDown className="h-3.5 w-3.5 text-muted/30 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </header>
  )
}

export default Header
