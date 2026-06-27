import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  AlertCircle, 
  Zap, 
  BarChart3, 
  Settings, 
  MessageSquareCode,
  Activity,
  ShieldCheck,
  Layers,
  Terminal,
  X
} from 'lucide-react'
import { cn } from '@/utils/cn'

const navigation = [
  { group: "Operational", items: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Incidents', href: '/incidents', icon: AlertCircle },
    { name: 'Alert Stream', href: '/alerts', icon: Activity },
  ]},
  { group: "Intelligence", items: [
    { name: 'AI SRE Copilot', href: '/ai-chat', icon: MessageSquareCode },
    { name: 'Predictive Insights', href: '/ai-insights', icon: Zap },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ]},
  { group: "System", items: [
    { name: 'Infrastructure', href: '/infrastructure', icon: Terminal },
    { name: 'Security Scan', href: '/security', icon: ShieldCheck },
    { name: 'Integrations', href: '/integrations', icon: Layers },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]}
]

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-primary/20 backdrop-blur-sm z-[150] lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-64 bg-[#0F172A] border-r border-[#334155] flex flex-col z-[200] transition-transform duration-300 lg:translate-x-0 outline-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Identity */}
        <div className="h-14 flex items-center px-6 border-b border-[#334155] justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 bg-[#2563EB] rounded-sm flex items-center justify-center text-white font-bold">
               <Activity className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-[14px] tracking-tight text-[#E2E8F0] uppercase">OpsMind <span className="text-[#2563EB]">SaaS</span></span>
          </div>
          <button className="lg:hidden text-[#94A3B8] hover:text-[#E2E8F0]" onClick={onClose}>
             <X className="h-5 w-5" />
          </button>
        </div>
 
        {/* Navigation Surface */}
        <nav className="flex-1 px-3 py-6 space-y-7 overflow-y-auto scrollbar-slim">
          {/* Pinned / Favorites */}
          <div>
            <h3 className="px-4 text-[9px] uppercase font-black text-[#94A3B8]/60 tracking-[0.2em] mb-3">
              Favorites
            </h3>
            <div className="space-y-0.5 px-1 truncate italic text-[#94A3B8]/40 text-[11px] font-medium px-4">
               No pinned resources
            </div>
          </div>

          {navigation.map((group) => (
            <div key={group.group}>
              <h3 className="px-4 text-[9px] uppercase font-black text-[#94A3B8]/60 tracking-[0.2em] mb-3">
                {group.group}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) => cn(
                      "group flex items-center gap-3 px-4 py-2 text-[12px] font-bold rounded-sm transition-colors duration-150 relative",
                      isActive 
                        ? "bg-[#2563EB] text-white" 
                        : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E2E8F0]"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-[#94A3B8] group-hover:text-[#E2E8F0]")} />
                        <span className="truncate">{item.name}</span>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Recent Activity Mini-stream */}
          <div className="pt-2">
            <h3 className="px-4 text-[9px] uppercase font-black text-[#94A3B8]/60 tracking-[0.2em] mb-3">
              Recently Viewed
            </h3>
            <div className="space-y-1 px-4 text-[10px] font-medium text-[#94A3B8]/80">
               <div className="flex items-center gap-2 hover:text-[#E2E8F0] cursor-pointer group">
                  <div className="h-1 w-1 rounded-full bg-[#334155] group-hover:bg-[#2563EB]" />
                  <span>INC-9482 (Payment-API)</span>
               </div>
               <div className="flex items-center gap-2 hover:text-[#E2E8F0] cursor-pointer group">
                  <div className="h-1 w-1 rounded-full bg-[#334155] group-hover:bg-[#2563EB]" />
                  <span>us-east-1-shard-04</span>
               </div>
            </div>
          </div>
        </nav>

        {/* Global Operational Context */}
        <div className="p-4 border-t border-[#334155]">
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Global State</span>
                <div className="flex gap-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_4px_#10B981/30]" title="Node Status: Healthy" />
                   <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" title="Sync Status: Active" />
                </div>
             </div>
             <div className="bg-[#1E293B] rounded-full h-1 w-full overflow-hidden">
                <div className="bg-[#2563EB] h-full w-[94%]" />
             </div>
          </div>
        </div>
      </aside>
    </>
  )
}


export default Sidebar
