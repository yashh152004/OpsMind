import React from 'react'

const IncidentsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Incidents</h1>
        <p className="mt-2 text-muted-foreground">Manage and track all incidents in your organization.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-8">
        <div className="text-center text-muted-foreground">
          <p className="mb-2">Incidents management interface</p>
          <p className="text-sm">This section will display all incidents with filtering, sorting, and detailed views.</p>
        </div>
      </div>
    </div>
  )
}

export default IncidentsPage
