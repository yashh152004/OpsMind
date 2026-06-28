import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, AlertCircle, Zap, BarChart3, Settings, MessageSquareCode,
  Activity, ShieldCheck, Layers, Terminal, Layout, X, ChevronDown, 
  Circle, Search, Star, Clock, Pin
} from 'lucide-react'
import { cn } from '@/utils/cn'

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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
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
        "fixed lg:static inset-y-0 left-0 bg-[#0B0B0B] flex flex-col z-[200] transition-all duration-300 ease-in-out border-r border-white/5",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-[64px]" : "w-[240px]"
      )}>
        {/* Workspace Switcher */}
        <div className={cn("h-14 flex items-center border-b border-white/5", isCollapsed ? "px-0 justify-center" : "px-4 justify-between")}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 bg-white rounded flex items-center justify-center shadow-lg">
               <Activity className="h-4 w-4 text-black" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                 <span className="font-bold text-[13px] tracking-tight text-white">OpsMind</span>
                 <div className="flex items-center gap-1 cursor-pointer">
                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Production</span>
                    <ChevronDown className="h-2.5 w-2.5 text-white/20" />
                 </div>
              </div>
            )}
          </div>
          {!isCollapsed && (
             <button onClick={onToggleCollapse} className="p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white transition-all">
                <Layout className="h-3.5 w-3.5" />
             </button>
          )}
        </div>

        {/* Global Search Quick Trigger */}
        {!isCollapsed && (
          <div className="px-4 py-4">
             <div className="flex items-center gap-2 px-3 h-8 bg-white/5 rounded border border-white/5 text-white/30 hover:bg-white/10 cursor-pointer transition-all">
                <Search className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium tracking-tight">Quick Search...</span>
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 bg-white/5 rounded border border-white/10">⌘K</span>
             </div>
          </div>
        )}

        {/* Navigation Surface */}
        <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto scrollbar-none">
          {navigation.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 mb-1.5">
                   <h3 className="text-[10px] uppercase font-bold text-white/20 tracking-widest border-none p-0 mb-0">
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
                      "group flex items-center gap-3 h-8 text-[12px] font-medium rounded transition-all relative",
                      isCollapsed ? "justify-center mx-1" : "px-3",
                      isActive 
                        ? "bg-white text-black shadow-lg" 
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0")} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                    {isCollapsed && (
                       <div className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 z-[1000]">
                          {item.name}
                       </div>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Context & Footer */}
        <div className="mt-auto border-t border-white/5 bg-white/2">
           {!isCollapsed && (
             <div className="p-4 space-y-4">
                <div className="flex items-center justify-between group cursor-pointer">
                   <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded bg-white/10 flex items-center justify-center text-[11px] font-bold text-white">JD</div>
                      <div className="flex flex-col">
                         <span className="text-[12px] font-bold text-white">John Doe</span>
                         <span className="text-[10px] font-medium text-white/30">Free Tier</span>
                      </div>
                   </div>
                   <Settings className="h-4 w-4 text-white/10 group-hover:text-white/40 transition-colors" />
                </div>
             </div>
           )}
           {isCollapsed && (
             <div className="p-3 flex justify-center">
                <button onClick={onToggleCollapse} className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/5 text-white/30 hover:text-white transition-all">
                   <Layout className="h-4 w-4 rotate-180" />
                </button>
             </div>
           )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
