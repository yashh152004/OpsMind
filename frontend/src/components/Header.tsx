import React from 'react'
import { Search, Bell, HelpCircle, ChevronDown, Command } from 'lucide-react'
import { useAuth } from '@/hooks'

const Header: React.FC = () => {
  const { user } = useAuth()

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8 sticky top-0 z-50">
      {/* Search / Command Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="w-full bg-accent/40 border border-border rounded-md pl-10 pr-12 py-1.5 text-sm focus:bg-background transition-all focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            placeholder="Search incidents, metric, or service..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
             <kbd className="h-5 px-1.5 bg-background border border-border rounded text-[10px] flex items-center gap-1 text-muted-foreground">
               <Command className="h-2.5 w-2.5" /> K
             </kbd>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-6">
        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full border-2 border-card" />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>
        
        <div className="h-6 w-px bg-border mx-2" />

        {/* Profile */}
        <button className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold leading-none">{user?.firstName} {user?.lastName}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Platform Admin</div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>
    </header>
  )
}

export default Header
