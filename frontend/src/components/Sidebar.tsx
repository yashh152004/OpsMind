import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, AlertCircle, Zap, BarChart3, Settings, MessageSquareCode,
  Activity, ShieldCheck, Layers, Terminal, Layout, X, ChevronDown, 
  Circle, Search, Star, Clock, Pin, Command
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
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[150] lg:hidden transition-all duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 bg-[#0A0A0A] flex flex-col z-[200] transition-all duration-300 ease-in-out border-r border-[#1A1A1A]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-[68px]" : "w-[248px]"
      )}>
        {/* Workspace Switcher */}
        <div className={cn("h-14 flex items-center border-[#1A1A1A]", isCollapsed ? "px-0 justify-center" : "px-4 justify-between")}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white rounded-[4px] flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <Activity className="h-5 w-5 text-black" />
            </div>
             {!isCollapsed && (
              <div className="flex flex-col">
                 <span className="font-bold text-[14px] tracking-tight text-white leading-none">OpsMind</span>
                 <div className="flex items-center gap-1 mt-1 cursor-pointer group">
                    <span className="text-[11px] font-bold text-neutral-400 group-hover:text-white transition-colors uppercase tracking-widest">
                      {user?.organizationName || 'Production'}
                    </span>
                    <ChevronDown className="h-3 w-3 text-neutral-500 group-hover:text-white" />
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Search Quick Trigger */}
        {!isCollapsed && (
          <div className="px-3 py-2">
             <button className="flex items-center gap-2 w-full px-3 h-9 bg-neutral-900/50 hover:bg-neutral-900 rounded-[4px] border border-neutral-800/50 text-neutral-500 hover:text-neutral-200 transition-all group">
                <Search className="h-4 w-4" />
                <span className="text-[13px] font-medium tracking-tight">Search...</span>
                <div className="ml-auto flex items-center gap-0.5 px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-[10px] font-bold">
                   <Command className="h-2.5 w-2.5" />
                   <span>K</span>
                </div>
             </button>
          </div>
        )}

        {/* Navigation Surface */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto no-scrollbar">
          {navigation.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 mb-2">
                   <h3 className="text-[11px] font-bold text-neutral-600 uppercase tracking-[0.15em]">
                     {group.group}
                   </h3>
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => cn(
                      "group flex items-center gap-3 h-9 text-[13px] font-bold rounded-[4px] transition-all relative",
                      isCollapsed ? "justify-center" : "px-3",
                      isActive 
                        ? "bg-neutral-800 text-white shadow-sm border border-neutral-700" 
                        : "text-neutral-300 hover:bg-neutral-900/80 hover:text-white"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110", isCollapsed ? "" : "")} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                        
                        {/* Active Indicator Pellet */}
                        {isActive && !isCollapsed && (
                           <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                        )}

                        {isCollapsed && (
                           <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-black text-white text-[12px] font-medium rounded-[4px] border border-neutral-800 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[1000]">
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

        {/* User Context & Footer */}
        <div className="mt-auto border-t border-neutral-900 bg-neutral-950/50">
           {!isCollapsed && (
             <div className="p-4">
                <div className="flex items-center justify-between group cursor-pointer p-2 rounded-[6px] hover:bg-neutral-900 transition-all">
                   <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-[4px] bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center text-[12px] font-bold text-white uppercase">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{(user?.firstName?.[0] || 'U') + (user?.lastName?.[0] || 'N')}</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                         <span className="text-[13px] font-semibold text-white truncate max-w-[120px]">
                            {user?.firstName} {user?.lastName}
                         </span>
                         <span className="text-[11px] font-medium text-neutral-500">
                            {user?.role || 'Operator'}
                         </span>
                      </div>
                   </div>
                   <Settings className="h-4 w-4 text-neutral-600 group-hover:text-neutral-300 transition-colors" />
                </div>
             </div>
           )}
           {isCollapsed && (
             <div className="p-4 flex items-center flex-col gap-4">
                <div className="h-10 w-10 rounded-[4px] bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center text-[11px] font-bold text-white uppercase shadow-sm">
                   {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                   ) : (
                      <span>{(user?.firstName?.[0] || 'U') + (user?.lastName?.[0] || 'N')}</span>
                   )}
                </div>
                <button onClick={onToggleCollapse} className="h-9 w-9 flex items-center justify-center rounded-[4px] hover:bg-neutral-800 text-neutral-600 hover:text-neutral-200 transition-all">
                   <Layout className="h-5 w-5 rotate-180" />
                </button>
             </div>
           )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
