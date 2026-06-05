import React from 'react'
import { useAuth } from '@/hooks'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back, {user?.firstName}! Here's your platform overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Active Incidents', value: '12', color: 'red' },
          { label: 'Triggered Alerts', value: '24', color: 'yellow' },
          { label: 'Resolved Today', value: '8', color: 'green' },
          { label: 'Team Members', value: '5', color: 'blue' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
            <div className="mt-2 text-3xl font-bold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Placeholders for charts and tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Recent Incidents</h2>
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                <div>
                  <p className="font-medium text-foreground">Database Connection Issue</p>
                  <p className="text-sm text-muted-foreground">Production Environment</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <span className="text-xs font-bold">P{i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Alert Trends</h2>
          <div className="mt-4">
            <div className="text-center text-muted-foreground">Chart coming soon</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
