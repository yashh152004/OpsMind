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
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-[150] lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col z-[200] transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              O
            </div>
            <span className="font-outfit font-bold text-lg tracking-tight">OpsMind</span>
          </div>
          <button className="lg:hidden text-muted-foreground p-1" onClick={onClose}>
             <Terminal className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-7 mt-4 overflow-y-auto">
          {navigation.map((group) => (
            <div key={group.group}>
              <h3 className="px-3 text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest mb-3">
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
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                      isActive 
                        ? "bg-primary/10 text-primary border-r-2 border-primary" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Branding */}
        <div className="p-4 border-t border-border">
          <div className="p-3 bg-accent/20 rounded-md border border-border/50">
            <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Grid Status</div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              Operational
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
