import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, AlertCircle, Zap, BarChart3, Settings, MessageSquareCode,
  Activity, ShieldCheck, Layers, Terminal, Layout, X, ChevronDown, 
  Search, Command
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/stores/auth'

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigation = [
  { group: "Operational", items: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Incidents', href: '/incidents', icon: AlertCircle },
    { name: 'Alert Stream', href: '/alerts', icon: Activity },
  ]},
  { group: "Intelligence", items: [
    { name: 'AI Copilot', href: '/ai-chat', icon: MessageSquareCode },
    { name: 'Insights', href: '/ai-insights', icon: Zap },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ]},
  { group: "Infrastructure", items: [
    { name: 'Service Map', href: '/infrastructure', icon: Terminal },
    { name: 'Security', href: '/security', icon: ShieldCheck },
    { name: 'Integrations', href: '/integrations', icon: Layers },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]}
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user } = useAuthStore()

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[150] lg:hidden transition-all duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 bg-surface flex flex-col z-[200] transition-all duration-300 ease-in-out border-r border-border shadow-sm",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-[68px]" : "w-[248px]"
      )}>
        {/* Workspace Switcher Unit */}
        <div className={cn("h-14 flex items-center border-b border-border text-left", isCollapsed ? "px-0 justify-center" : "pl-4 pr-3 justify-between")}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-foreground rounded-[var(--radius)] flex items-center justify-center shadow-md">
               <Activity className="h-4.5 w-4.5 text-background" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                 <span className="font-semibold text-[14px] text-foreground leading-none tracking-tight">OpsMind</span>
                 <div className="flex items-center gap-1 mt-0.5 cursor-pointer group">
                    <span className="text-[10px] font-bold text-muted transition-colors uppercase tracking-widest truncate max-w-[110px]">
                      {user?.organizationName || 'Production'}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                 </div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={onToggleCollapse} 
              className="h-8 w-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-surface-hover text-muted hover:text-foreground transition-all duration-150"
              title="Collapse sidebar"
            >
               <Layout className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Global Search Quick Trigger */}
        {!isCollapsed && (
          <div className="px-3 pt-3">
             <button className="flex items-center gap-2 w-full px-2.5 h-8.5 bg-surface-alt hover:bg-surface-hover rounded-[var(--radius)] border border-border text-muted-foreground hover:text-foreground transition-all duration-150 group">
                <Search className="h-3.5 w-3.5" />
                <span className="text-[13px] font-normal tracking-tight">Search...</span>
                <div className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 bg-surface border border-border rounded text-[9px] font-medium text-muted uppercase">
                   <Command className="h-2.5 w-2.5" />
                   <span>K</span>
                </div>
             </button>
          </div>
        )}

        {/* Navigation Areas */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto no-scrollbar">
          {navigation.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2 mb-1.5">
                   <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest select-none">
                     {group.group}
                   </span>
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) => cn(
                      "group flex items-center gap-3 h-8.5 text-[15px] font-medium rounded-[var(--radius)] transition-all duration-150 relative",
                      isCollapsed ? "justify-center w-10 h-10 mx-auto" : "px-2.5",
                      isActive 
                        ? "bg-secondary text-foreground shadow-xs border border-border-strong/10" 
                        : "text-muted hover:bg-surface-hover hover:text-foreground"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                        
                        {/* Active Indicator Dot */}
                        {isActive && !isCollapsed && (
                           <div className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-foreground shadow-sm animate-pulse" />
                        )}

                        {isCollapsed && (
                           <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-[12px] font-medium rounded-[var(--radius)] shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-[1000]">
                              {item.name}
                           </div>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User context / Collapse indicator block */}
        <div className="mt-auto border-t border-border bg-surface-alt/30">
           {!isCollapsed && (
             <div className="p-3">
                <div className="flex items-center justify-between group cursor-pointer p-1.5 rounded-[var(--radius)] hover:bg-surface-hover transition-all duration-150">
                   <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8.5 w-8.5 rounded-[var(--radius)] bg-secondary border border-border-strong/10 overflow-hidden flex items-center justify-center text-[12px] font-semibold text-foreground uppercase shrink-0">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{(user?.firstName?.[0] || 'U') + (user?.lastName?.[0] || 'N')}</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 text-left">
                         <span className="text-[13px] font-semibold text-foreground truncate max-w-[130px] leading-tight">
                            {user?.firstName} {user?.lastName}
                         </span>
                         <span className="text-[11px] font-normal text-muted truncate max-w-[130px] leading-none mt-0.5">
                            {user?.role || 'Operator'}
                         </span>
                      </div>
                   </div>
                </div>
             </div>
           )}
           {isCollapsed && (
             <div className="p-3 flex items-center flex-col gap-3">
                <div className="h-9.5 w-9.5 rounded-[var(--radius)] bg-secondary border border-border-strong/10 overflow-hidden flex items-center justify-center text-[12px] font-semibold text-foreground uppercase shadow-xs">
                   {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                   ) : (
                      <span>{(user?.firstName?.[0] || 'U') + (user?.lastName?.[0] || 'N')}</span>
                   )}
                </div>
                <button 
                  onClick={onToggleCollapse} 
                  className="h-8 w-8 flex items-center justify-center rounded-[var(--radius)] hover:bg-surface-hover text-muted hover:text-foreground transition-all duration-150"
                  title="Expand sidebar"
                >
                   <Layout className="h-4.5 w-4.5 rotate-180" />
                </button>
             </div>
           )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
