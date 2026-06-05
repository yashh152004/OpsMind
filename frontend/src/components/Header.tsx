import React from 'react'
import { Menu, User, Bell } from 'lucide-react'
import { useAuth } from '@/hooks'

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth()

  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Menu and Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">OpsMind</h2>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative rounded-lg p-2 hover:bg-muted">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <User className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
