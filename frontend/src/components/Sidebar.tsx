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
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#334155] justify-between bg-[#0B1222]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#2563EB] rounded flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-[15px] tracking-tight text-[#E2E8F0] uppercase">OpsMind <span className="text-[#2563EB]">SaaS</span></span>
          </div>
          <button className="lg:hidden text-[#94A3B8] hover:text-[#E2E8F0] p-1" onClick={onClose}>
             <X className="h-5 w-5" />
          </button>
        </div>
 
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto scrollbar-slim">
          {navigation.map((group) => (
            <div key={group.group}>
              <h3 className="px-4 text-[10px] uppercase font-black text-[#94A3B8]/40 tracking-[0.25em] mb-4">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) => cn(
                      "group flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold rounded transition-all duration-150 relative border border-transparent",
                      isActive 
                        ? "bg-[#2563EB] text-white shadow-xl shadow-blue-500/10 border-blue-400/20" 
                        : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E2E8F0]"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-white" : "text-[#94A3B8] group-hover:text-[#E2E8F0]")} />
                        <span className="truncate">{item.name}</span>
                        {isActive && (
                           <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-white/40 shadow-[0_0_8px_white]" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Platform Status Footer */}
        <div className="p-3 border-t border-[#334155] bg-[#0B1222]">
          <div className="p-2.5 bg-[#1E293B]/40 rounded-sm border border-[#334155]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Global State</span>
              <div className="flex gap-1">
                 <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                 <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-full bg-[#0F172A] rounded-full h-1 overflow-hidden">
                  <div className="bg-[#2563EB] h-full w-[94%]" />
               </div>
               <span className="text-[9px] font-bold text-[#E2E8F0]">94%</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}


export default Sidebar
