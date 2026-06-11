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
  Activity,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { exportToCSV } from '@/utils/export'

const IncidentsPage: React.FC = () => {
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newIncident, setNewIncident] = useState({ title: '', severity: 'P2', serviceName: '', description: '' })
  const [activeTab, setActiveTab] = useState('ALL')
  const tabs = ['ALL', 'OPEN', 'INVESTIGATING', 'IDENTIFIED', 'MITIGATING', 'RESOLVED', 'CLOSED']

  const { data: incidents, isLoading, isError, refetch } = useQuery({
    queryKey: ['incidents', page, searchTerm, activeTab],
    queryFn: () => apiClient.getIncidents('default'),
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.createIncident('default', { ...newIncident, status: 'OPEN' })
      setIsCreateModalOpen(false)
      setNewIncident({ title: '', severity: 'P2', serviceName: '', description: '' })
      refetch()
    } catch (err) {
      console.error('Failed to create incident', err)
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await apiClient.resolveIncident(id, 'Resolved via SRE Management Console')
      refetch()
    } catch (err) {
      console.error('Failed to resolve', err)
    }
  }

  // Local filtering for smooth UX
  const filteredIncidents = incidents?.filter((i: any) => {
    const matchesSearch = (i.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (i.serviceName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'ALL' || i.status === activeTab
    return matchesSearch && matchesTab
  })

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
          <button className="btn-primary h-9 text-xs" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Declare Incident
          </button>
        </div>
      </div>

      {/* Declare Incident Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="enterprise-card max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-4">Declare New Incident</h3>
            <form onSubmit={handleCreate} className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-muted-foreground uppercase">Title</label>
                 <input 
                  required
                  placeholder="e.g. Cache layer pod eviction"
                  className="input-field mt-1" 
                  value={newIncident.title}
                  onChange={e => setNewIncident({...newIncident, title: e.target.value})}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase">Severity</label>
                    <select 
                      className="input-field mt-1"
                      value={newIncident.severity}
                      onChange={e => setNewIncident({...newIncident, severity: e.target.value})}
                    >
                       <option value="P1">P1 - Critical</option>
                       <option value="P2">P2 - Warning</option>
                       <option value="P3">P3 - Notice</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase">Service</label>
                    <input 
                      required
                      placeholder="Service Name"
                      className="input-field mt-1"
                      value={newIncident.serviceName}
                      onChange={e => setNewIncident({...newIncident, serviceName: e.target.value})}
                    />
                  </div>
               </div>
               <div>
                 <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
                 <textarea 
                  required
                  placeholder="Technical details..."
                  className="input-field mt-1 h-24"
                  value={newIncident.description}
                  onChange={e => setNewIncident({...newIncident, description: e.target.value})}
                 />
               </div>
               <div className="flex gap-3 justify-end pt-2">
                  <button type="button" className="btn-ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Initialize Incident</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center border-b border-border mb-4 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
              activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </button>
        ))}
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
                    {incident.status !== 'RESOLVED' && (
                      <button 
                        className="btn-ghost text-emerald-500 hover:bg-emerald-500/10" 
                        title="Resolve Incident"
                        onClick={() => handleResolve(incident.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    <button className="btn-ghost" title="View Trace"><ExternalLink className="h-4 w-4" /></button>
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
