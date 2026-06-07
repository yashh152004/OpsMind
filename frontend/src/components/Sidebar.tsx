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
  Terminal,
  ShieldCheck
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
    { name: 'Settings', href: '/settings', icon: Settings },
  ]}
]

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white font-bold text-xl">
            O
          </div>
          <span className="font-outfit font-bold text-lg tracking-tight">OpsMind</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-8 mt-4">
        {navigation.map((group) => (
          <div key={group.group}>
            <h3 className="px-3 text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-border">
        <div className="p-3 bg-accent/30 rounded-md">
          <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            All Systems Operational
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
