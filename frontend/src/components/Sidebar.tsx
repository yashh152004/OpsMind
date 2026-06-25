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
  Terminal
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
        "fixed lg:static inset-y-0 left-0 w-60 bg-primary border-r border-secondary flex flex-col z-[200] transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div className="h-14 flex items-center px-4 border-b border-secondary justify-between bg-[#0B1222]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 bg-accent rounded-sm flex items-center justify-center text-white font-bold">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white uppercase">OpsMind</span>
          </div>
          <button className="lg:hidden text-muted hover:text-white p-1" onClick={onClose}>
             <Terminal className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-4 mt-2 overflow-y-auto scrollbar-slim">
          {navigation.map((group) => (
            <div key={group.group}>
              <h3 className="px-3 text-[10px] uppercase font-bold text-muted/60 tracking-[0.15em] mb-2">
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
                      "flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-sm transition-all duration-150",
                      isActive 
                        ? "bg-accent text-white shadow-sm shadow-accent/20" 
                        : "text-muted hover:bg-secondary hover:text-white"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-muted/60")} />
                        <span>{item.name}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Platform Status Footer */}
        <div className="p-3 border-t border-secondary bg-[#0B1222]">
          <div className="p-2.5 bg-secondary/30 rounded-sm border border-secondary/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Workspace</span>
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
            </div>
            <div className="text-[11px] font-semibold text-white truncate">production-cluster-01</div>
          </div>
        </div>
      </aside>
    </>
  )
}


export default Sidebar
