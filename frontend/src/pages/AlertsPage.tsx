import React from 'react'

const AlertsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
        <p className="mt-2 text-muted-foreground">Monitor and manage alert rules and triggered alerts.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <div className="text-center text-muted-foreground">
          <p className="mb-2">Alerts management interface</p>
          <p className="text-sm">This section will display all alerts and allow you to create and manage alert rules.</p>
        </div>
      </div>
    </div>
  )
}

export default AlertsPage
