import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  Command, 
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
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 sticky top-0 z-[100]">
      {/* Mobile Toggle */}
      <button 
        onClick={onToggleSidebar}
        className="lg:hidden mr-4 text-muted-foreground hover:text-foreground p-2 hover:bg-accent rounded-md transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Global Search Interface */}
      <div className="flex-1 max-w-md relative hidden sm:block" ref={searchRef}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 2 && setShowResults(true)}
            className="w-full bg-accent/40 border border-border rounded-md pl-10 pr-12 py-1.5 text-sm focus:bg-background transition-all focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            placeholder="Search cluster... (Cmd + K)"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none hidden md:flex">
             <kbd className="h-5 px-1.5 bg-background border border-border rounded text-[10px] flex items-center gap-1 text-muted-foreground">
                <Command className="h-2.5 w-2.5" /> K
             </kbd>
          </div>
        </div>

        {showResults && (
           <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl max-h-[400px] overflow-y-auto z-[200] animate-in fade-in slide-in-from-top-2">
              {results.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">No matches for "{query}"</div>
              ) : (
                <div className="p-2 space-y-1">
                   {results.map((item, i) => (
                     <div 
                       key={i} 
                       onClick={() => {
                         setShowResults(false)
                         navigate(item.type === 'INCIDENT' ? '/incidents' : item.type === 'ALERT' ? '/alerts' : '/infrastructure')
                       }}
                       className="p-3 hover:bg-accent rounded-md cursor-pointer flex items-center justify-between group transition-colors"
                     >
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-background border border-border rounded flex items-center justify-center text-primary">
                             {item.type === 'INCIDENT' ? <AlertCircle className="h-4 w-4" /> : item.type === 'ALERT' ? <Terminal className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                          </div>
                          <div>
                             <div className="text-xs font-bold">{item.title}</div>
                             <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{item.subtitle}</div>
                          </div>
                       </div>
                       <div className="text-[10px] font-bold text-muted-foreground border border-border px-1.5 rounded uppercase">
                          {item.type}
                       </div>
                     </div>
                   ))}
                </div>
              )}
           </div>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-6 ml-auto">
        <button className="text-muted-foreground hover:text-foreground transition-colors relative" onClick={() => navigate('/alerts')}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[10px] text-white flex items-center justify-center rounded-full border-2 border-card font-bold animate-in zoom-in">
              {unreadCount}
            </span>
          )}
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
          <HelpCircle className="h-5 w-5" />
        </button>
        
        <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

        <button className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-md shadow-primary/20 transition-transform group-hover:scale-110">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold leading-none">{user?.firstName}</div>
            <div className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tighter">SRE_ADMIN</div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>
    </header>
  )
}


export default Header
