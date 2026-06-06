import React from 'react'
import { Search, Bell, Settings, Command } from 'lucide-react'
import { useAuth } from '@/hooks'

const Header: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="flex w-full items-center justify-between gap-8">
      {/* Search Bar */}
      <div className="relative group w-full max-w-md hidden sm:block">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search for incidents, logs, services... (Ctrl + K)"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-11 text-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-2 ml-auto">
        <button className="relative p-2.5 rounded-xl hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </button>
        
        <button className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground">
          <Command className="h-5 w-5" />
        </button>

        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="hidden lg:block text-right">
            <div className="text-sm font-bold">{user?.firstName} {user?.lastName}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Standard SRE</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary shadow-inner">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
