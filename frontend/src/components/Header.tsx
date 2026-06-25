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
    <header className="h-16 border-b border-[#E2E8F0] bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-[100]">
      {/* Mobile Toggle */}
      <button 
        onClick={onToggleSidebar}
        className="lg:hidden mr-4 text-slate-500 hover:text-[#0F172A] p-2 hover:bg-slate-50 rounded-md transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Global Search Interface */}
      <div className="flex-1 max-w-md relative hidden sm:block" ref={searchRef}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded px-10 py-1.5 text-xs text-[#0F172A] placeholder:text-slate-400 transition-all focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none"
            placeholder="Global search telemetry, logs, resources..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none hidden md:flex">
             <kbd className="h-5 px-1.5 bg-white border border-[#E2E8F0] rounded text-[10px] flex items-center gap-1 text-slate-400 font-bold uppercase tracking-tighter">
                CMD K
             </kbd>
          </div>
        </div>

        {/* Environment Status Indicator */}
        <div className="hidden lg:flex items-center gap-4 px-4 h-8 bg-slate-50 border border-slate-200 rounded text-[10px] font-black uppercase tracking-widest text-slate-500">
           <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PROD-US-EAST
           </span>
           <span className="w-px h-3 bg-slate-300" />
           <span className="text-blue-600">v3.4.2-stable</span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8 ml-auto">
        <div className="flex items-center gap-1 md:gap-2">
           <button className="text-slate-500 hover:text-[#0F172A] transition-colors relative p-2 hover:bg-slate-50 rounded-full" onClick={() => navigate('/alerts')}>
             <Bell className="h-5 w-5" />
             {unreadCount > 0 && (
               <span className="absolute top-1 right-1 h-4 w-4 bg-red-600 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-white font-bold">
                 {unreadCount}
               </span>
             )}
           </button>
           <button className="text-slate-500 hover:text-[#0F172A] transition-colors hidden sm:block p-2 hover:bg-slate-50 rounded-full">
             <HelpCircle className="h-5 w-5" />
           </button>
        </div>
        
        <div className="h-8 w-px bg-[#E2E8F0] mx-0 hidden sm:block" />

        <div className="flex items-center gap-4 pl-2">
           <div className="hidden lg:block text-right">
             <div className="text-sm font-bold text-[#0F172A] leading-tight">{user?.firstName} {user?.lastName}</div>
             <div className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.1em]">Principal SRE</div>
           </div>
           <button className="flex items-center gap-2 group p-1 bg-slate-50 border border-[#E2E8F0] rounded-full pr-3 hover:bg-white transition-colors">
             <div className="h-8 w-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs shadow-inner">
               {user?.firstName?.[0] || 'U'}
             </div>
             <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-[#0F172A] transition-colors" />
           </button>
        </div>
      </div>
    </header>
  )
}


export default Header
