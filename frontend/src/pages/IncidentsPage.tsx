import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Clock, 
  ExternalLink, 
  Filter,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Terminal,
  Activity,
  CheckCircle2,
  BrainCircuit
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { exportToCSV } from '@/utils/export'
import { useOrganization } from '@/hooks'

const IncidentsPage: React.FC = () => {
  const { organizationId } = useOrganization()
  const [page] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newIncident, setNewIncident] = useState({ title: '', severity: 'P2', serviceName: '', description: '' })
  const [activeTab, setActiveTab] = useState('ALL')
  const navigate = useNavigate()
  const tabs = ['ALL', 'OPEN', 'INVESTIGATING', 'IDENTIFIED', 'MITIGATING', 'RESOLVED', 'CLOSED']

  const { data: incidents, isLoading, isError, refetch } = useQuery({
    queryKey: ['incidents', page, searchTerm, activeTab],
    queryFn: () => apiClient.getIncidents(organizationId || 'default'),
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.createIncident(organizationId || 'default', { ...newIncident, status: 'OPEN' })
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
    <div className="space-y-8 page-transition pb-12">
      {/* Structural Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Incident Stream</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Operational log of systemic disruptions and service outages.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-[#0F172A] font-bold text-xs rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Export Dataset
          </button>
          <button className="px-4 py-2 bg-[#2563EB] text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10 flex items-center gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Declare Incident
          </button>
        </div>
      </div>

      {/* Declare Incident Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full p-8 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-[#0F172A] mb-6">Initialize New Incident</h3>
            <form onSubmit={handleCreate} className="space-y-6">
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Label</label>
                 <input 
                  required
                  placeholder="e.g. Cluster auth-service degradation"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium mt-2 focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all" 
                  value={newIncident.title}
                  onChange={e => setNewIncident({...newIncident, title: e.target.value})}
                 />
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Severity</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold mt-2 focus:bg-white outline-none"
                      value={newIncident.severity}
                      onChange={e => setNewIncident({...newIncident, severity: e.target.value})}
                    >
                       <option value="P1">P1 - Critical (Outage)</option>
                       <option value="P2">P2 - Major (Disruption)</option>
                       <option value="P3">P3 - Minor (Service Notice)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Affected Service</label>
                    <input 
                      required
                      placeholder="Auth_Service_V1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium mt-2 focus:bg-white focus:ring-2 focus:ring-blue-600/10 outline-none"
                      value={newIncident.serviceName}
                      onChange={e => setNewIncident({...newIncident, serviceName: e.target.value})}
                    />
                  </div>
               </div>
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Briefing</label>
                 <textarea 
                  required
                  placeholder="Describe the detected anomaly and its scope..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium mt-2 h-32 focus:bg-white focus:ring-2 focus:ring-blue-600/10 outline-none resize-none"
                  value={newIncident.description}
                  onChange={e => setNewIncident({...newIncident, description: e.target.value})}
                 />
               </div>
               <div className="flex gap-4 justify-end pt-4">
                  <button type="button" className="text-slate-400 hover:text-slate-600 font-bold text-xs px-4" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                  <button type="submit" className="bg-[#0F172A] text-white px-6 py-2.5 rounded-lg font-bold text-xs shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">Begin Triage</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative border-b-2",
              activeTab === tab ? "text-blue-600 border-blue-600" : "text-slate-400 border-transparent hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search incident profiles, service identifiers, or telemetry context..."
            className="w-full bg-white border border-slate-200 rounded-xl px-12 py-3 text-sm font-medium text-[#0F172A] outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
             <Filter className="h-3.5 w-3.5 mr-2" /> 
             Filter
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
             <Activity className="h-3.5 w-3.5 mr-2" /> 
             Real-Time
          </div>
        </div>
      </div>

      {/* Data Surface */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">UUID</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Incident Context</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hidden lg:table-cell">Tier</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Operational State</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hidden xl:table-cell">Service</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hidden sm:table-cell">Detected At</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-8 py-6"><div className="h-10 w-full bg-slate-100 animate-pulse rounded-lg" /></td>
                </tr>
              ))
            ) : isError ? (
               <tr><td colSpan={7} className="px-8 py-16 text-center text-red-600 font-black text-sm uppercase tracking-widest bg-red-50/30">Failed to sync incident stream. Check API connectivity.</td></tr>
            ) : !filteredIncidents?.length ? (
               <tr><td colSpan={7} className="px-8 py-16 text-center text-slate-400 font-bold text-sm">No incidents match current filter criteria.</td></tr>
            ) : filteredIncidents?.map((incident: any) => (
              <tr key={incident.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-blue-600">
                <td className="px-8 py-6 font-mono text-[11px] text-blue-600 font-black">
                  #{incident.id.toString().padStart(4, '0')}
                </td>
                <td className="px-8 py-6">
                  <div className="font-extrabold text-[#0F172A] text-sm leading-tight">{incident.title}</div>
                  <div className="text-[10px] text-slate-400 mt-2 font-bold line-clamp-1 uppercase tracking-tight">{incident.description}</div>
                </td>
                <td className="px-8 py-6 hidden lg:table-cell">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border",
                    incident.severity === 'P1' ? "bg-red-50 text-red-600 border-red-100" :
                    incident.severity === 'P2' ? "bg-orange-50 text-orange-600 border-orange-100" :
                    "bg-blue-50 text-blue-600 border-blue-100"
                  )}>
                    {incident.severity}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      incident.status === 'RESOLVED' ? "bg-emerald-500" : "bg-orange-500 animate-pulse"
                    )} />
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{incident.status}</span>
                  </div>
                </td>
                <td className="px-8 py-6 hidden xl:table-cell">
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <Terminal className="h-3.5 w-3.5 text-slate-400" />
                      {incident.serviceName}
                   </div>
                </td>
                <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                      title="AI Root Cause Analysis"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/ai-chat', { state: { initialMessage: `/rca ${incident.id}` } });
                      }}
                    >
                      <BrainCircuit className="h-4 w-4" />
                    </button>
                    {incident.status !== 'RESOLVED' && (
                      <button 
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" 
                        title="Resolve Manually"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(incident.id)
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    <button className="p-2 text-slate-300 hover:text-[#0F172A] hidden sm:inline-flex" title="External Link"><ExternalLink className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination Console */}
        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Operational Units: {filteredIncidents?.length || 0} sync'd
           </div>
           <div className="flex items-center gap-3">
              <button disabled className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              <div className="text-xs font-black text-[#0F172A]">01</div>
              <button disabled className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
           </div>
        </div>
      </div>
    </div>
  )
}

export default IncidentsPage
