import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Plus, Search, Download, Terminal, CheckCircle2, X, Filter, Users, 
  Shield, Activity, AlertTriangle, ChevronRight, History, MessageSquare, 
  Info, ArrowUpRight, SlidersHorizontal, ChevronDown, Circle, RefreshCcw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useOrganization } from '@/hooks'
import { toast } from 'sonner'

const IncidentsPage: React.FC = () => {
  const { organizationId } = useOrganization()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('ALL')
  const [page, setPage] = useState(0)
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [bulkSelection, setBulkSelection] = useState<number[]>([])

  const [declaration, setDeclaration] = useState({
    title: '', description: '', severity: 'P2', priority: 'HIGH',
    serviceName: '', environment: 'PRODUCTION', cluster: 'us-east-1',
    category: 'INFRA', impact: '', owner: 'system'
  })

  // Enterprise Data Grid Fetching
  const { data: pageData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['incidents-search', searchTerm, activeTab, page],
    queryFn: () => apiClient.searchIncidents({
      q: searchTerm,
      status: activeTab === 'ALL' ? '' : activeTab,
      page,
      size: 12,
      sort: 'createdAt,desc'
    }),
    placeholderData: (previous: any) => previous
  })

  const incidents = pageData?.content || []

  // Cascade Invalidation Strategy
  const triggerCascadeSync = () => {
    queryClient.invalidateQueries({ queryKey: ['incidents-search'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    queryClient.invalidateQueries({ queryKey: ['alerts'] })
    queryClient.invalidateQueries({ queryKey: ['infrastructure'] })
  }

  const declareMutation = useMutation({
    mutationFn: (data: any) => apiClient.createIncident(organizationId || 'default', data),
    onSuccess: () => {
      triggerCascadeSync()
      setIsDeclareModalOpen(false)
      toast.success('MISSION_INITIATED: Incident record generated and broadcasted.', {
         description: 'Notification channels synchronized via US-EAST-1.',
         icon: <Shield className="h-4 w-4 text-black" />
      })
      setDeclaration({
        title: '', description: '', severity: 'P2', priority: 'HIGH',
        serviceName: '', environment: 'PRODUCTION', cluster: 'us-east-1',
        category: 'INFRA', impact: '', owner: 'system'
      })
    }
  })

  const handleExport = async () => {
    try {
      const blob = await apiClient.exportModule('incidents')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `OpsMind_Incident_Audit_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      toast.success('Operational audit exported.')
    } catch (err) {
      toast.error('Export failure.')
    }
  }

  const lifecycle = ['OPEN', 'INVESTIGATING', 'IDENTIFIED', 'MITIGATING', 'MONITORING', 'RESOLVED']

  return (
    <div className="page-transition-fade space-y-8 p-10 bg-white min-h-screen">
      {/* Dynamic Header Overlay */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tighter text-black m-0 font-geist">Incident Control</h1>
           <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-sm border border-emerald-100">
                 <Activity className="h-3 w-3 animate-pulse" /> Core Signal Integrity Nominal
              </span>
              <div className="h-4 w-[1px] bg-border" />
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Logic Provider: us-east-ingress</span>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExport} className="btn-secondary h-10 gap-2 border-strong">
              <Download className="h-4 w-4" />
              <span>Export Audit</span>
           </button>
           <button onClick={() => setIsDeclareModalOpen(true)} className="btn-primary h-10 gap-2 shadow-xl shadow-black/10">
              <Plus className="h-4 w-4" />
              <span>Declare Incident</span>
           </button>
        </div>
      </div>

      {/* Control Strip & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div className="flex items-center gap-1 p-1 bg-surface-alt rounded-md border border-border">
            {['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'].map(tab => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setPage(0); }}
                className={cn(
                  "px-6 py-1.5 text-[11px] font-black uppercase tracking-widest rounded transition-all",
                  activeTab === tab ? "bg-white text-black shadow-sm ring-1 ring-black/5" : "text-muted hover:text-primary"
                )}
              >
                {tab}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-3">
            <div className="relative group max-w-sm">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted group-focus-within:text-black transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search Reference, Asset, or Tier..." 
                 className="input-field pl-9 h-10 border-strong" 
                 value={searchTerm}
                 onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
               />
            </div>
            <button onClick={() => refetch()} className={cn("p-2 border border-border hover:border-black rounded transition-all", isRefetching && "animate-spin")}>
               <RefreshCcw className="h-4 w-4 text-muted" />
            </button>
         </div>
      </div>

      {/* Enterprise Data Grid */}
      <div className="enterprise-table-container shadow-2xl shadow-black/5 overflow-hidden">
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th className="w-12 text-center"><Circle className="h-3 w-3" /></th>
                  <th className="w-40">Operational ID</th>
                  <th>Incident Logic Context</th>
                  <th className="w-32">Severity</th>
                  <th className="w-40 text-center">Lifecycle Status</th>
                  <th className="w-40 text-right">Detection Time</th>
                  <th className="w-12 text-center"></th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="py-12"><div className="h-6 skeleton w-full" /></td></tr>
                  ))
               ) : incidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-40">
                          <Activity className="h-12 w-12" />
                          <div className="space-y-1">
                             <div className="text-xs font-black uppercase tracking-widest text-black">Operating Within Nominal Limits</div>
                             <p className="text-[10px] font-bold uppercase tracking-tighter text-muted">No active signal breaches found for current filter</p>
                          </div>
                       </div>
                    </td>
                  </tr>
               ) : incidents.map((incident: any) => (
                  <tr key={incident.id} onClick={() => { setSelectedIncident(incident); setIsDetailDrawerOpen(true); }} className="group hover:bg-surface-alt/50 transition-all cursor-pointer border-l-2 border-transparent hover:border-black">
                     <td className="text-center" onClick={e => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={bulkSelection.includes(incident.id)}
                          onChange={() => setBulkSelection(prev => prev.includes(incident.id) ? prev.filter(id => id !== incident.id) : [...prev, incident.id])}
                          className="rounded-none border-strong" 
                        />
                     </td>
                     <td>
                        <span className="font-mono text-[11px] font-black text-black bg-surface-alt px-2 py-1 border border-border">
                           ID-{incident.id.toString().padStart(6, '0')}
                        </span>
                     </td>
                     <td className="py-5">
                        <div className="flex flex-col gap-1 pr-10">
                           <div className="text-[14px] font-black text-black group-hover:underline underline-offset-4 decoration-1 decoration-black/10">
                              {incident.title}
                           </div>
                           <div className="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-2 italic">
                              {incident.serviceName} • {incident.category} • us-east-1
                           </div>
                        </div>
                     </td>
                     <td>
                        <span className={cn(
                          "status-badge",
                          incident.severity === 'P1' ? "badge-critical" : 
                          incident.severity === 'P2' ? "badge-warning" : "badge-info"
                        )}>{incident.severity} Class</span>
                     </td>
                     <td className="text-center">
                        <div className="flex flex-col items-center gap-1.5">
                           <div className={cn("h-1.5 w-1.5 rounded-full", incident.status === 'RESOLVED' ? "bg-emerald-500" : "bg-red-500")} />
                           <span className="text-[9px] font-black text-black uppercase tracking-[0.2em]">{incident.status}</span>
                        </div>
                     </td>
                     <td className="text-right">
                        <div className="font-mono text-[11px] font-black text-muted italic">
                           {new Date(incident.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                     </td>
                     <td className="text-center">
                        <ChevronRight className="h-4 w-4 text-muted group-hover:text-black transition-colors" />
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>

         {/* Enterprise Data Grid Pagination */}
         {pageData && pageData.totalPages > 1 && (
            <div className="px-8 py-4 bg-surface-alt border-t border-border flex items-center justify-between">
               <div className="text-[10px] font-bold text-muted uppercase tracking-widest">
                  Page <span className="text-black font-black">{page + 1}</span> of <span className="text-black font-black">{pageData.totalPages}</span>
               </div>
               <div className="flex gap-1">
                  <button 
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="h-8 px-4 border border-strong bg-white text-[10px] font-black uppercase hover:bg-surface-alt disabled:opacity-20 transition-all"
                  >Prev</button>
                  <button 
                    disabled={page >= pageData.totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="h-8 px-4 border border-strong bg-white text-[10px] font-black uppercase hover:bg-surface-alt disabled:opacity-20 transition-all"
                  >Next</button>
               </div>
            </div>
         )}
      </div>

      {/* Incident Command Drawer */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-[640px] bg-white shadow-2xl z-[500] border-l border-strong transform transition-transform duration-500 ease-in-out flex flex-col scale-100",
        isDetailDrawerOpen ? "translate-x-0" : "translate-x-full"
      )}>
         {selectedIncident && (
            <>
               <div className="p-8 border-b border-border bg-surface-alt flex items-center justify-between">
                  <div className="space-y-1">
                     <div className="text-[10px] font-black text-muted uppercase tracking-[0.3em] flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Operational Command Loop
                     </div>
                     <h2 className="text-2xl font-black text-black tracking-tighter leading-none font-geist uppercase">{selectedIncident.title}</h2>
                  </div>
                  <button onClick={() => setIsDetailDrawerOpen(false)} className="h-12 w-12 flex items-center justify-center hover:bg-white border-strong rounded transition-all text-muted hover:text-black">
                     <X className="h-8 w-8" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-10 space-y-12">
                  <div className="grid grid-cols-2 gap-10">
                     <div className="space-y-2">
                         <div className="text-[9px] font-black text-muted uppercase tracking-widest">Severity Class</div>
                         <div className="flex items-center gap-2">
                            <span className={cn("h-4 w-4 rounded-sm", selectedIncident.severity === 'P1' ? "bg-red-600" : "bg-black")} />
                            <span className="text-lg font-black text-black italic">{selectedIncident.severity} MAJOR SIGNAL</span>
                         </div>
                     </div>
                     <div className="space-y-2">
                         <div className="text-[9px] font-black text-muted uppercase tracking-widest">Primary Environment</div>
                         <div className="text-lg font-black text-black uppercase">{selectedIncident.environment} / {selectedIncident.cluster}</div>
                     </div>
                  </div>

                  <section className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-black text-black uppercase tracking-widest mb-0 border-none flex items-center gap-2">
                           <History className="h-4 w-4" /> Signal Progression
                        </h3>
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest">Latency: 1.4ms</span>
                     </div>
                     <div className="flex items-center gap-2">
                        {lifecycle.map((step, idx) => {
                           const isCurrent = selectedIncident.status === step;
                           const isPast = lifecycle.indexOf(selectedIncident.status) > idx;
                           return (
                             <div key={step} className="flex-1">
                                <div className={cn(
                                   "h-1.5 rounded-full transition-all duration-1000",
                                   isPast ? "bg-black" : isCurrent ? "bg-black animate-pulse" : "bg-border"
                                )} />
                                <div className={cn(
                                   "mt-2 text-[8px] font-black uppercase tracking-tighter whitespace-nowrap",
                                   isCurrent ? "text-black" : "text-muted opacity-40"
                                )}>{step}</div>
                             </div>
                           )
                        })}
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h3 className="text-[11px] font-black text-black uppercase tracking-widest mb-0 border-none flex items-center gap-2">
                        <Info className="h-4 w-4" /> Strategic Context
                     </h3>
                     <div className="p-8 bg-surface-alt border border-strong rounded space-y-8 relative overflow-hidden group">
                        <div className="grid grid-cols-2 gap-10">
                           <div className="space-y-1">
                              <div className="text-[9px] font-black text-muted uppercase tracking-widest">Affected Entity</div>
                              <div className="text-sm font-black text-black uppercase tracking-widest">{selectedIncident.serviceName}</div>
                           </div>
                           <div className="space-y-1">
                              <div className="text-[9px] font-black text-muted uppercase tracking-widest">Ingress Shard</div>
                              <div className="text-sm font-black text-black uppercase tracking-widest">{selectedIncident.cluster}</div>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="text-[9px] font-black text-muted uppercase tracking-widest border-l-2 border-black pl-3">Technical Impact Analysis</div>
                           <p className="text-[14px] font-medium text-black leading-relaxed italic pr-6">
                              "{selectedIncident.description}"
                           </p>
                        </div>
                     </div>
                  </section>
               </div>

               <div className="p-10 border-t border-border bg-white flex gap-4">
                  <button className="btn-secondary flex-1 h-12 uppercase tracking-[0.2em] border-strong">
                     <MessageSquare className="h-4 w-4" /> Timeline
                  </button>
                  <button className="btn-primary flex-1 h-12 uppercase tracking-[0.2em] shadow-xl shadow-black/10">
                     Update Signal Status
                  </button>
               </div>
            </>
         )}
      </div>

      {/* MODAL: Declare Incident - MONOCHROME REFINEMENT */}
      {isDeclareModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white border border-black w-full max-w-2xl rounded-none shadow-[20px_20px_0px_rgba(0,0,0,0.1)] overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
              <div className="px-10 py-8 border-b border-border bg-surface-alt flex items-center justify-between">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-black font-geist">Initiate Operational Command</h2>
                    <p className="text-[11px] text-muted font-bold uppercase tracking-widest">Scale platform response bandwidth immediately</p>
                 </div>
                 <button onClick={() => setIsDeclareModalOpen(false)} className="text-muted hover:text-black transition-colors"><X className="h-8 w-8" /></button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); declareMutation.mutate(declaration); }} className="p-12 space-y-10 max-h-[70vh] overflow-y-auto scrollbar-none">
                 <div className="space-y-8">
                    <div className="group space-y-2">
                       <label className="form-label">Signal Identifier / Mission Brief</label>
                       <input 
                         required 
                         className="input-field h-12 font-black text-lg border-strong focus:border-black" 
                         placeholder="e.g. CRITICAL_DB_LATENCY" 
                         value={declaration.title} 
                         onChange={e => setDeclaration({...declaration, title: e.target.value.toUpperCase()})} 
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                       <div className="group space-y-2">
                          <label className="form-label">Impacted Service Node</label>
                          <input required className="input-field h-10 font-bold border-strong" placeholder="auth-gateway" value={declaration.serviceName} onChange={e => setDeclaration({...declaration, serviceName: e.target.value})} />
                       </div>
                       <div className="group space-y-2">
                          <label className="form-label">Operational Tier</label>
                          <select className="input-field h-10 font-black cursor-pointer border-strong" value={declaration.severity} onChange={e => setDeclaration({...declaration, severity: e.target.value})}>
                             <option value="P1">P1 - CRITICAL</option>
                             <option value="P2">P2 - MAJOR</option>
                             <option value="P3">P3 - MINOR</option>
                          </select>
                       </div>
                    </div>
                    <div className="group space-y-2">
                       <label className="form-label">Tactical Narrative</label>
                       <textarea required className="input-field h-32 font-bold leading-relaxed resize-none pt-4 border-strong" placeholder="Provide deep context for triage squad..." value={declaration.description} onChange={e => setDeclaration({...declaration, description: e.target.value})} />
                    </div>
                 </div>
                 
                 <div className="p-8 border border-black bg-black text-white flex items-center justify-between">
                    <div className="space-y-1 pr-6">
                       <div className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Platform Lock: ON</div>
                       <p className="text-[11px] font-medium leading-tight">Notification broadcast will be triggered across 14 channels immediately.</p>
                    </div>
                    <button 
                      type="submit"
                      disabled={declareMutation.isPending}
                      className="bg-white text-black font-black h-14 px-10 text-[11px] uppercase tracking-widest hover:bg-white/90 transition-all active:scale-[0.98] shrink-0"
                    >
                       {declareMutation.isPending ? 'Syncing...' : 'Initiate Command'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Floating Action Bar - MONOCHROME */}
      {bulkSelection.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black px-10 py-5 rounded-none shadow-2xl z-[1000] flex items-center gap-10 animate-in slide-in-from-bottom-10 border border-white/10">
           <div className="flex items-center gap-4">
              <span className="h-8 w-8 bg-white text-black rounded-none flex items-center justify-center font-black text-xs">{bulkSelection.length}</span>
              <div className="text-[11px] font-black text-white uppercase tracking-widest">Signals Selected</div>
           </div>
           <div className="flex items-center gap-6">
              <button onClick={() => { apiClient.bulkResolveIncidents(bulkSelection); setBulkSelection([]); toast.success('Bulk triage successful.'); triggerCascadeSync(); }} className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors flex items-center gap-2">
                 <CheckCircle2 className="h-4 w-4" /> Mitigate
              </button>
              <button className="text-[10px] font-black text-white/50 uppercase tracking-widest hover:text-white transition-colors">Assign Squad</button>
              <button onClick={() => setBulkSelection([])} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Abort</button>
           </div>
        </div>
      )}
    </div>
  )
}

export default IncidentsPage
