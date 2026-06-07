import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Filter,
  MoreVertical,
  Plus,
  Search
} from 'lucide-react'
import { cn } from '@/utils/cn'

const IncidentsPage: React.FC = () => {
  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => apiClient.getIncidents('default'), // Simplified for this context
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Incidents</h1>
          <p className="text-muted-foreground">Manage and track production service interruptions.</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          Track New Incident
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search incidents by title, service, or SRE..."
            className="input-field pl-10 h-10"
          />
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Incident</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Severity</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Service</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Detected</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-8 bg-white/5" />
                </tr>
              ))
            ) : incidents?.map((incident: any) => (
              <tr key={incident.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold">{incident.title}</div>
                  <div className="text-xs text-muted-foreground">#{incident.id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    incident.severity === 'P1' ? "bg-red-500/20 text-red-500" :
                    incident.severity === 'P2' ? "bg-orange-500/20 text-orange-500" :
                    "bg-blue-500/20 text-blue-500"
                  )}>
                    {incident.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      incident.status === 'RESOLVED' ? "bg-emerald-500" : "bg-orange-500 animate-pulse"
                    )} />
                    <span className="text-sm">{incident.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{incident.serviceName}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {new Date(incident.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground group-hover:text-foreground">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground group-hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && (!incidents || incidents.length === 0) && (
          <div className="p-20 text-center text-muted-foreground">
            No incidents detected. System is healthy.
          </div>
        )}
      </div>
    </div>
  )
}

export default IncidentsPage
