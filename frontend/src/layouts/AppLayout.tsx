import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Structural Sidebar - Fixed Width */}
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation / Breadcrumbs */}
        <Header />

        {/* Main Operational Surface */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-[1600px] mx-auto page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
