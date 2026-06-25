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
      toast.error('Initialization failed.')
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await apiClient.resolveIncident(id, 'Automated resolution via OpsMind SRE Console')
      toast.success('Incident resolved.')
      refetch()
    } catch (err) {
      toast.error('Operation failed.')
    }
  }

  const filteredIncidents = incidents?.filter((i: any) => {
    const matchesSearch = (i.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (i.serviceName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'ALL' || i.status === activeTab
    return matchesSearch && matchesTab
  })

  const handleExport = () => {
    if (filteredIncidents) exportToCSV(filteredIncidents, 'OpsMind_IncidentDataset')
  }

  return (
    <div className="space-y-4 page-transition pb-20">
      {/* Structural Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
           <h1 className="text-xl font-black text-slate-900 tracking-tight">Incident Command</h1>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 Management of active systemic disruptions • {incidents?.filter((i:any) => i.status !== 'RESOLVED').length || 0} Open
              </span>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleExport} className="btn-secondary h-8 px-3 text-[10px] font-black uppercase tracking-wider">
              <Download className="h-3.5 w-3.5" /> Export
           </button>
           <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary h-8 px-3 text-[10px] font-black uppercase tracking-wider">
              <Plus className="h-4 w-4" /> Declare Incident
           </button>
        </div>
      </div>

      {/* Control & Tab Surface */}
      <div className="enterprise-card p-2">
         <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
            <div className="flex items-center gap-1 border-b lg:border-b-0 lg:border-r border-slate-100 pr-4 overflow-x-auto no-scrollbar">
               {tabs.map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={cn(
                     "px-3 py-1.5 text-[10px] font-black uppercase tracking-tighter transition-all rounded",
                     activeTab === tab ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-100"
                   )}
                 >
                   {tab}
                 </button>
               ))}
            </div>
            <div className="flex-1 max-w-md relative group px-2">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search by ID, title, or service context..." 
                 className="input-field pl-9 h-8 text-[11px]" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex items-center gap-1 px-4">
               <button className="btn-ghost p-1.5"><Filter className="h-4 w-4 text-slate-400" /></button>
               <button className="btn-ghost p-1.5"><MoreVertical className="h-4 w-4 text-slate-400" /></button>
            </div>
         </div>
      </div>

      {/* Data Table */}
      <div className="enterprise-card overflow-hidden">
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th className="w-20">ID</th>
                  <th>Incident Logic & Context</th>
                  <th className="w-20">Tier</th>
                  <th className="w-32">Status</th>
                  <th className="w-32">Service</th>
                  <th className="w-40">Detection</th>
                  <th className="w-24 text-right">Audit</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="py-4 px-4"><div className="h-8 skeleton" /></td></tr>
                  ))
               ) : !filteredIncidents?.length ? (
                  <tr>
                     <td colSpan={7} className="py-20 text-center text-slate-400 font-bold text-sm uppercase tracking-widest opacity-30">No active incidents</td>
                  </tr>
               ) : filteredIncidents?.map((incident: any) => (
                  <tr key={incident.id} className="group hover:bg-slate-50 transition-colors">
                     <td className="metric-mono text-blue-600 text-xs">#{incident.id.toString().padStart(4, '0')}</td>
                     <td>
                        <div className="text-[12px] font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate max-w-[240px]">
                           {incident.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
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
                           <span className={cn("signal-dot", incident.status === 'RESOLVED' ? "bg-emerald-500" : "bg-orange-500 animate-pulse")} />
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{incident.status}</span>
                        </div>
                     </td>
                     <td>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                           <Terminal className="h-3.5 w-3.5 text-slate-300" />
                           {incident.serviceName}
                        </div>
                     </td>
                     <td>
                        <span className="text-[10px] font-medium text-slate-400 metric-mono flex items-center gap-2">
                           <Clock className="h-3.5 w-3.5" />
                           {new Date(incident.createdAt).toLocaleTimeString([], { hour12: false })}
                        </span>
                     </td>
                     <td className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={(e) => { e.stopPropagation(); navigate('/ai-chat', { state: { initialMessage: `/rca ${incident.id}` } }); }} className="btn-ghost" title="AI RCA">
                              <BrainCircuit className="h-4 w-4 text-blue-600" />
                           </button>
                           {incident.status !== 'RESOLVED' && (
                             <button onClick={(e) => { e.stopPropagation(); handleResolve(incident.id); }} className="btn-ghost" title="Resolve">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                             </button>
                           )}
                           <button className="btn-ghost" title="Details"><ExternalLink className="h-4 w-4" /></button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Triage Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-slate-200 w-full max-w-lg rounded-lg shadow-2xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                 <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Declare System Incident</h2>
                 <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Incident Identifier / Brief</label>
                    <input required className="input-field" placeholder="e.g. US-EAST Auth Service Degradation" value={newIncident.title} onChange={e => setNewIncident({...newIncident, title: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Impact Severity</label>
                       <select className="input-field" value={newIncident.severity} onChange={e => setNewIncident({...newIncident, severity: e.target.value})}>
                          <option value="P1">P1 - Critical (Outage)</option>
                          <option value="P2">P2 - Major (Disruption)</option>
                          <option value="P3">P3 - Minor (Notice)</option>
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service Context</label>
                       <input required className="input-field" placeholder="e.g. Identity_V1_Core" value={newIncident.serviceName} onChange={e => setNewIncident({...newIncident, serviceName: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Briefing</label>
                    <textarea required className="input-field h-24 resize-none" placeholder="Enter initial triage notes and suspected impact zones..." value={newIncident.description} onChange={e => setNewIncident({...newIncident, description: e.target.value})} />
                 </div>
                 <div className="pt-4 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Begin Triage Stream</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}

export default IncidentsPage
