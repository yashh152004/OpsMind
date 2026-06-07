import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Filter,
  MoreVertical,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Terminal,
  Activity
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { exportToCSV } from '@/utils/export'

const IncidentsPage: React.FC = () => {
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: incidents, isLoading, isError } = useQuery({
    queryKey: ['incidents', page, searchTerm],
    queryFn: () => apiClient.getIncidents('default'),
  })

  // Local filtering for smooth UX
  const filteredIncidents = incidents?.filter((i: any) => 
    (i.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (i.serviceName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (i.severity?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleExport = () => {
    if (filteredIncidents) {
      exportToCSV(filteredIncidents, 'OpsMind_Incidents')
    }
  }

  return (
    <div className="space-y-6 page-transition">
      {/* Structural Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-outfit">Incident Management</h1>
          <p className="text-muted-foreground text-sm font-medium">Monitoring trackable service disruptions and outages.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary h-9 text-xs" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1" />
            Export Log
          </button>
          <button className="btn-primary h-9 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Declare Incident
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Filter by ID, service, or keyword..."
            className="input-field pl-10 h-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-card border border-border rounded-md px-3 py-2 text-xs font-bold text-muted-foreground">
             <Filter className="h-3.5 w-3.5 mr-2" /> 
             All Statuses
          </div>
          <div className="flex items-center bg-card border border-border rounded-md px-3 py-2 text-xs font-bold text-muted-foreground">
             <Activity className="h-3.5 w-3.5 mr-2" /> 
             Last 24h
          </div>
        </div>
      </div>

      {/* Data Surface */}
      <div className="enterprise-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-accent/40 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">IDENTIFIER</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">INCIDENT PROFILE</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SEVERITY</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">STATUS</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SERVICE</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">DETECTED</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-6 py-4"><div className="h-10 w-full skeleton" /></td>
                </tr>
              ))
            ) : isError ? (
               <tr><td colSpan={7} className="px-6 py-12 text-center text-destructive font-bold">Failed to load incident stream. Reconneting...</td></tr>
            ) : filteredIncidents?.map((incident: any) => (
              <tr key={incident.id} className="hover:bg-accent/20 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-mono text-xs text-primary font-bold">
                  #{incident.id.toString().padStart(4, '0')}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-sm leading-none">{incident.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-1.5 font-medium line-clamp-1">{incident.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "status-badge",
                    incident.severity === 'P1' ? "badge-critical" :
                    incident.severity === 'P2' ? "badge-warning" :
                    "badge-info"
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
                    <span className="text-xs font-bold text-foreground/80">{incident.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Terminal className="h-3 w-3" />
                      {incident.serviceName}
                   </div>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {new Date(incident.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="btn-ghost" title="View Trace"><ExternalLink className="h-4 w-4" /></button>
                    <button className="btn-ghost" title="Options"><MoreVertical className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination Console */}
        <div className="px-6 py-4 bg-accent/20 border-t border-border flex items-center justify-between">
           <div className="text-[10px] font-bold text-muted-foreground uppercase">
             Showing {incidents?.length || 0} of {incidents?.length || 0} trackable units
           </div>
           <div className="flex items-center gap-2">
              <button disabled className="p-1 border border-border rounded bg-card disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              <div className="text-xs font-bold px-2">Page 1</div>
              <button disabled className="p-1 border border-border rounded bg-card disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
           </div>
        </div>
      </div>
    </div>
  )
}

export default IncidentsPage
