import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Clock, 
  ExternalLink, 
  Filter,
  Plus,
  Search,
  Download,
  Terminal,
  CheckCircle2,
  BrainCircuit,
  MoreVertical,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { exportToCSV } from '@/utils/export'
import { useOrganization } from '@/hooks'
import { toast } from 'sonner'

const IncidentsPage: React.FC = () => {
  const { organizationId } = useOrganization()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newIncident, setNewIncident] = useState({ title: '', severity: 'P2', serviceName: '', description: '' })
  const [activeTab, setActiveTab] = useState('ALL')
  const navigate = useNavigate()
  
  const tabs = ['ALL', 'OPEN', 'INVESTIGATING', 'IDENTIFIED', 'MITIGATING', 'RESOLVED']

  const { data: incidents, isLoading, refetch } = useQuery({
    queryKey: ['incidents', organizationId, searchTerm, activeTab],
    queryFn: () => apiClient.getIncidents(organizationId || 'default'),
    refetchInterval: 15000
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.createIncident(organizationId || 'default', { ...newIncident, status: 'OPEN' })
      setIsCreateModalOpen(false)
      setNewIncident({ title: '', severity: 'P2', serviceName: '', description: '' })
      toast.success('Incident declared successfully.')
      refetch()
    } catch (err) {
      toast.error('Failed to initialize incident.')
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await apiClient.resolveIncident(id, 'Resolved via OpsMind Console')
      toast.success('Incident resolved.')
      refetch()
    } catch (err) {
      toast.error('Failed to resolve incident.')
    }
  }

  const filteredIncidents = incidents?.filter((i: any) => {
    const matchesSearch = (i.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (i.serviceName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'ALL' || i.status === activeTab
    return matchesSearch && matchesTab
  })

  const handleExport = async () => {
    try {
      const blob = await apiClient.exportModule('incidents');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OpsMind_Incidents_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Incidents exported successfully.');
    } catch (err) {
      toast.error('Failed to generate export file.');
    }
  }

  return (
    <div className="main-content-grid page-transition-fade">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
           <h1 className="text-page-title">Incident Management</h1>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-helper font-medium">
                 {incidents?.filter((i:any) => i.status !== 'RESOLVED').length || 0} active disruptions detected
              </span>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleExport} className="btn-secondary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Data
           </button>
           <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">
              <Plus className="h-4 w-4 mr-1.5" /> Declare Incident
           </button>
        </div>
      </div>

      {/* Filters HUD */}
      <div className="enterprise-card p-2 bg-slate-50/50">
         <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
            <div className="flex items-center gap-1 border-r border-border pr-2 overflow-x-auto scrollbar-slim">
               {tabs.map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={cn(
                     "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-sm",
                     activeTab === tab ? "bg-primary text-white" : "text-muted hover:bg-slate-200"
                   )}
                 >
                   {tab}
                 </button>
               ))}
            </div>
            <div className="flex-1 relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted group-focus-within:text-accent transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search incidents by ID, title, or service..." 
                 className="input-field pl-9 h-9" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
      </div>

      {/* Incident List */}
      <div className="enterprise-table-container">
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th className="w-24">Reference</th>
                  <th>Incident Context</th>
                  <th className="w-24">Severity</th>
                  <th className="w-32">Status</th>
                  <th className="w-32">Affected Service</th>
                  <th className="w-32">Detected At</th>
                  <th className="w-24 text-right">Actions</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="py-8"><div className="h-4 bg-slate-100 animate-pulse rounded w-full" /></td></tr>
                  ))
               ) : !filteredIncidents?.length ? (
                  <tr>
                     <td colSpan={7} className="py-20 text-center text-muted font-semibold text-sm uppercase tracking-widest opacity-40">No incidents found</td>
                  </tr>
               ) : filteredIncidents?.map((incident: any) => (
                  <tr key={incident.id} className="group">
                     <td>
                        <span className="font-mono text-xs font-bold text-accent">#INC-{(incident.id || '').toString().slice(-4)}</span>
                     </td>
                     <td>
                        <div className="text-[13px] font-bold text-primary truncate max-w-[300px]">
                           {incident.title}
                        </div>
                        <div className="text-[11px] text-muted line-clamp-1">
                           {incident.description}
                        </div>
                     </td>
                     <td>
                        <span className={cn(
                          "status-badge",
                          incident.severity === 'P1' ? "badge-critical" : incident.severity === 'P2' ? "badge-warning" : "badge-info"
                        )}>{incident.severity}</span>
                     </td>
                     <td>
                        <div className="flex items-center gap-2">
                           <span className={cn("h-1.5 w-1.5 rounded-full", incident.status === 'RESOLVED' ? "bg-success" : "bg-warning animate-pulse")} />
                           <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{incident.status}</span>
                        </div>
                     </td>
                     <td>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted">
                           <Terminal className="h-3 w-3" />
                           {incident.serviceName}
                        </div>
                     </td>
                     <td>
                        <span className="text-[11px] font-medium text-muted flex items-center gap-1.5">
                           <Clock className="h-3 w-3" />
                           {new Date(incident.createdAt).toLocaleTimeString([], { hour12: false })}
                        </span>
                     </td>
                     <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                           <button onClick={(e) => { e.stopPropagation(); navigate('/ai-chat', { state: { initialMessage: `/analyze incident ${incident.id}` } }); }} className="btn-ghost hover:bg-blue-50" title="AI Analysis">
                              <BrainCircuit className="h-3.5 w-3.5 text-accent" />
                           </button>
                           {incident.status !== 'RESOLVED' && (
                             <button onClick={(e) => { e.stopPropagation(); handleResolve(incident.id); }} className="btn-ghost hover:bg-emerald-50" title="Resolve">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                             </button>
                           )}
                           <button className="btn-ghost hover:bg-slate-100" title="View Details"><ExternalLink className="h-3.5 w-3.5" /></button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Incident Declaration Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-border w-full max-w-lg rounded shadow-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-slate-50 flex items-center justify-between">
                 <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Declare Incident</h2>
                 <button onClick={() => setIsCreateModalOpen(false)} className="text-muted hover:text-critical transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-5 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Incident Title</label>
                    <input required className="input-field" placeholder="e.g., Database Connection Timeout in Production" value={newIncident.title} onChange={e => setNewIncident({...newIncident, title: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Severity Tier</label>
                       <select className="input-field cursor-pointer" value={newIncident.severity} onChange={e => setNewIncident({...newIncident, severity: e.target.value})}>
                          <option value="P1">P1 - Critical Impact</option>
                          <option value="P2">P2 - Significant Impact</option>
                          <option value="P3">P3 - Minor Impact</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Target Service</label>
                       <input required className="input-field" placeholder="e.g., auth-v2-api" value={newIncident.serviceName} onChange={e => setNewIncident({...newIncident, serviceName: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Description & Impact</label>
                    <textarea required className="input-field h-24 resize-none" placeholder="Provide detailed context for the response team..." value={newIncident.description} onChange={e => setNewIncident({...newIncident, description: e.target.value})} />
                 </div>
                 <div className="pt-2 flex items-center justify-end gap-3 border-t border-border mt-6 pt-4">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary h-9">Discard</button>
                    <button type="submit" className="btn-primary h-9 px-6">Confirm Declaration</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}


export default IncidentsPage
