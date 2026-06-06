import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, AlertCircle, Bell, Settings, LogOut, X, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks'
import { cn } from '@/utils/cn'

interface SidebarProps {
  onClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation()
  const { logout } = useAuth()

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Incidents', icon: AlertCircle, href: '/incidents' },
    { label: 'Alerts', icon: Bell, href: '/alerts' },
    { label: 'AI Chat', icon: MessageSquare, href: '/ai-chat' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ]

  return (
    <div className="flex h-full flex-col bg-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-6">
        <h1 className="text-xl font-bold text-foreground">OpsMind</h1>
        <button
          onClick={onClose}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              )}
              onClick={onClose}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <button
          onClick={() => {
            logout()
            onClose?.()
          }}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  )
}

export default Sidebar
