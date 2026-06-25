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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
    const fetchNotifications = async () => {
      try {
        const data = await apiClient.getNotifications()
        setUnreadCount(data.length)
      } catch (e) {
        console.error("Failed to fetch notifications")
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

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

        {/* Search Results Dropdown Placeholder */}
        {showResults && (
           <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-sm shadow-lg z-[200] max-h-96 overflow-y-auto p-1">
              {results.length > 0 ? (
                results.map((res, i) => (
                  <button key={i} className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-sm flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 bg-slate-100 rounded flex items-center justify-center text-muted">
                        <Terminal className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-[12px] font-semibold text-primary">{res.name || res.title}</div>
                        <div className="text-[10px] text-muted">{res.type} • {res.location}</div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-muted text-xs">No matching enterprise resources found.</div>
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

        <div className="flex items-center gap-1">
           <button className="text-muted hover:text-primary transition-colors relative p-2 hover:bg-slate-50 rounded-sm" onClick={() => navigate('/alerts')}>
             <Bell className="h-4.5 w-4.5" />
             {unreadCount > 0 && (
               <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-critical rounded-full border border-white" />
             )}
           </button>
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
