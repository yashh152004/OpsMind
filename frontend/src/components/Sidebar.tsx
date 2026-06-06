import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  AlertCircle, 
  Bell, 
  Settings, 
  LogOut, 
  X, 
  MessageSquare,
  Activity,
  BarChart3,
  Search,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { cn } from '@/utils/cn'

interface SidebarProps {
  onClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation()
  const { logout } = useAuth()

  const navGroups = [
    {
      title: 'Monitoring',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Incidents', icon: AlertCircle, href: '/incidents' },
        { label: 'Alerts', icon: Bell, href: '/alerts' },
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { label: 'AI Insights', icon: ShieldCheck, href: '/ai-insights' },
        { label: 'AI Copilot', icon: MessageSquare, href: '/ai-chat' },
        { label: 'Analytics', icon: BarChart3, href: '/analytics' },
      ]
    },
    {
      title: 'Platform',
      items: [
        { label: 'Settings', icon: Settings, href: '/settings' },
      ]
    }
  ]

  return (
    <div className="flex h-full flex-col bg-card/40 backdrop-blur-xl border-r border-white/5">
      {/* Brand */}
      <div className="flex items-center gap-3 p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl premium-gradient shadow-lg shadow-blue-500/20">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold font-outfit tracking-tight">OpsMind</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {navGroups.map((group, idx) => (
          <div key={group.title} className={cn("mb-8", idx === 0 && "mt-2")}>
            <h3 className="mb-4 px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    )}
                    onClick={onClose}
                  >
                    <Icon className={cn(
                      'h-5 w-5 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    )} />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User / Logout */}
      <div className="mt-auto border-t border-white/5 p-4">
        <button
          onClick={() => {
            logout()
            onClose?.()
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive/80 hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  )
}

export default Sidebar
