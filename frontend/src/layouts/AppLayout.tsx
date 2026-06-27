import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import DemoController from '@/components/DemoController'
import { cn } from '@/utils/cn'

const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - Responsive Handle */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className={cn("flex flex-1 flex-col overflow-hidden transition-all duration-300", isCollapsed ? "pl-0" : "pl-0")}>
        {/* Header with toggle */}
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Main Operational Surface */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-[1600px] mx-auto page-transition pb-20 md:pb-0">
            <Outlet />
          </div>
        </main>
        
        {/* Demo Mode Overlay */}
        <DemoController />
      </div>
    </div>
  )
}

export default AppLayout
