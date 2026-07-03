import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Plus, Search, Download, Terminal, CheckCircle2, X, Filter, Users, 
  Shield, Activity, AlertTriangle, ChevronRight, History, MessageSquare, 
  Info, ArrowUpRight, SlidersHorizontal, ChevronDown, Circle, RefreshCcw,
  Clock, Hash, MapPin, User
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
      size: 14,
      sort: 'createdAt,desc'
    }),
    placeholderData: (previous: any) => previous
  })

  const incidents = pageData?.content || []

  const triggerCascadeSync = () => {
    queryClient.invalidateQueries({ queryKey: ['incidents-search'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    queryClient.invalidateQueries({ queryKey: ['alerts'] })
  }

  const declareMutation = useMutation({
    mutationFn: (data: any) => apiClient.createIncident(organizationId || 'default', data),
    onSuccess: () => {
      triggerCascadeSync()
      setIsDeclareModalOpen(false)
      toast.success('Incident declared successfully.')
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
      a.download = `OpsMind_Incidents_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      toast.success('Export completed.')
    } catch (err) {
      toast.error('Export failed.')
    }
  }

  const lifecycle = ['OPEN', 'INVESTIGATING', 'IDENTIFIED', 'MITIGATING', 'MONITORING', 'RESOLVED']

  return (
    <div className="page-transition-fade space-y-6 p-6 lg:p-8 bg-background min-h-screen max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold tracking-tight text-foreground m-0">Incident Management</h1>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded text-[11px] font-bold uppercase tracking-wider">
                 <Shield className="h-3.5 w-3.5" />
                 Active Control
              </div>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted flex items-center gap-1.5">
                 <Activity className="h-3.5 w-3.5 text-emerald-500" /> System Monitoring Active
              </p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExport} className="btn-secondary h-9">
              <Download className="h-4 w-4" />
              <span>Export Audit</span>
           </button>
           <button onClick={() => setIsDeclareModalOpen(true)} className="btn-primary h-9">
              <Plus className="h-4 w-4" />
              <span>Declare Incident</span>
           </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
         <div className="flex items-center gap-1 p-1 bg-surface-alt rounded-lg border border-border">
            {['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'].map(tab => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setPage(0); }}
                className={cn(
                  "px-4 py-1.5 text-[12px] font-semibold rounded-md transition-all",
                  activeTab === tab ? "bg-white text-foreground shadow-sm border border-border" : "text-muted hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-3 flex-1 lg:max-w-md">
            <div className="relative w-full group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-foreground transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search by ID, title, or service..." 
                 className="input-enterprise pl-10 w-full" 
                 value={searchTerm}
                 onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
               />
            </div>
            <button onClick={() => refetch()} className="btn-secondary h-9 w-9 p-0 flex items-center justify-center">
               <RefreshCcw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
            </button>
         </div>
      </div>

      {/* Main Grid */}
      <div className="table-container">
         <table className="table-enterprise">
            <thead>
               <tr>
                  <th className="w-10 text-center">
                     <input type="checkbox" className="rounded-[4px] border-border-strong h-3.5 w-3.5" />
                  </th>
                  <th className="w-28">Ref ID</th>
                  <th>Incident Context</th>
                  <th className="w-24">Severity</th>
                  <th className="w-32 text-center">Lifecycle</th>
                  <th className="w-40 text-right">Last Signal</th>
                  <th className="w-10"></th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  Array(10).fill(0).map((_, i) => (
                    <tr key={i}>
                       <td colSpan={7} className="py-8">
                          <div className="h-4 skeleton-ui w-full opacity-90" />
                       </td>
                    </tr>
                  ))
               ) : incidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                       <Activity className="h-10 w-10 text-border mx-auto mb-4" />
                       <div className="text-[13px] font-bold text-foreground mb-1">Clear Skies</div>
                       <p className="text-[12px] text-muted">No incidents matching your current filters.</p>
                    </td>
                  </tr>
               ) : incidents.map((incident: any) => (
                  <tr key={incident.id} 
                      onClick={() => { setSelectedIncident(incident); setIsDetailDrawerOpen(true); }} 
                      className="group cursor-pointer hover:bg-surface-hover/80 transition-colors border-l-2 border-l-transparent hover:border-l-foreground">
                     <td className="text-center" onClick={e => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={bulkSelection.includes(incident.id)}
                          onChange={() => setBulkSelection(prev => prev.includes(incident.id) ? prev.filter(id => id !== incident.id) : [...prev, incident.id])}
                          className="rounded-[4px] border-border-strong h-3.5 w-3.5" 
                        />
                     </td>
                     <td>
                        <span className="font-mono text-[11px] font-bold text-muted bg-surface-alt px-1.5 py-0.5 rounded border border-border">
                           #{incident.id.toString().padStart(4, '0')}
                        </span>
                     </td>
                     <td className="py-4">
                        <div className="flex flex-col gap-0.5">
                           <div className="text-[14px] font-bold text-foreground group-hover:underline">
                              {incident.title}
                           </div>
                           <div className="text-[11px] text-muted font-medium flex items-center gap-1.5">
                              <span className="text-foreground">{incident.serviceName}</span>
                              <span className="text-border">•</span>
                              <span>{incident.cluster}</span>
                           </div>
                        </div>
                     </td>
                     <td>
                        <span className={cn(
                          "badge-enterprise",
                          incident.severity === 'P1' ? "badge-critical" : 
                          incident.severity === 'P2' ? "badge-warning" : "badge-info"
                        )}>{incident.severity}</span>
                     </td>
                     <td className="text-center">
                        <div className="flex flex-col items-center gap-1">
                           <div className={cn("h-1.5 w-1.5 rounded-full", 
                              incident.status === 'RESOLVED' ? "bg-emerald-500" : 
                              incident.status === 'OPEN' ? "bg-red-500 animate-pulse" : "bg-amber-500"
                           )} />
                           <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{incident.status}</span>
                        </div>
                     </td>
                     <td className="text-right">
                        <div className="text-[12px] text-muted font-semibold">
                           {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                     </td>
                     <td className="text-center">
                        <ChevronRight className="h-4 w-4 text-muted group-hover:text-foreground transition-colors" />
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>

         {/* Pagination */}
         {pageData && pageData.totalPages > 1 && (
            <div className="px-6 py-3 bg-surface-alt/50 border-t border-border flex items-center justify-between">
               <div className="text-[11px] font-bold text-muted uppercase tracking-widest">
                  Page {page + 1} of {pageData.totalPages}
               </div>
               <div className="flex gap-2">
                  <button 
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="btn-secondary h-8 px-3 text-[11px]"
                  >Previous</button>
                  <button 
                    disabled={page >= pageData.totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="btn-secondary h-8 px-3 text-[11px]"
                  >Next</button>
               </div>
            </div>
         )}
      </div>

      {/* Incident Detail Drawer */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full max-w-[600px] bg-surface shadow-2xl z-[500] border-l border-border transform transition-transform duration-300 ease-in-out flex flex-col",
        isDetailDrawerOpen ? "translate-x-0" : "translate-x-full"
      )}>
         {selectedIncident && (
            <>
               <div className="px-8 py-6 border-b border-border bg-surface-alt/50 flex items-center justify-between">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold bg-foreground text-white px-1.5 py-0.5 rounded">INC-{selectedIncident.id}</span>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[11px] font-bold text-muted uppercase tracking-widest">{selectedIncident.category}</span>
                     </div>
                     <h2 className="text-xl font-bold text-foreground leading-tight">{selectedIncident.title}</h2>
                  </div>
                  <button onClick={() => setIsDetailDrawerOpen(false)} className="p-2 hover:bg-surface-alt rounded-full transition-colors">
                     <X className="h-6 w-6" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                  {/* Status Bar */}
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <label className="text-[11px] font-bold text-muted uppercase tracking-widest">Severity Class</label>
                        <div className="flex items-center gap-2">
                           <div className={cn("h-3 w-3 rounded-full", selectedIncident.severity === 'P1' ? "bg-red-500" : "bg-foreground")} />
                           <span className="text-[14px] font-bold text-foreground">{selectedIncident.severity} - CRITICAL RESPONSE</span>
                        </div>
                     </div>
                     <div className="space-y-1 text-right">
                        <label className="text-[11px] font-bold text-muted uppercase tracking-widest">Environment</label>
                        <div className="flex items-center gap-2 justify-end">
                           <MapPin className="h-3.5 w-3.5 text-muted" />
                           <span className="text-[14px] font-bold text-foreground uppercase tracking-tight">{selectedIncident.environment} / {selectedIncident.cluster}</span>
                        </div>
                     </div>
                  </div>

                  {/* Progressive Lifecycle */}
                  <section className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h3 className="text-[12px] font-bold text-foreground mb-0 flex items-center gap-2">
                           <History className="h-4 w-4" /> Signal Progression
                        </h3>
                        <span className="text-[11px] font-bold text-muted italic">MTTR Estimate: 45m</span>
                     </div>
                     <div className="flex items-center gap-2">
                        {lifecycle.map((step, idx) => {
                           const isCurrent = selectedIncident.status === step;
                           const isPast = lifecycle.indexOf(selectedIncident.status) > idx;
                           return (
                             <div key={step} className="flex-1">
                                <div className={cn(
                                   "h-1.5 rounded-full transition-all duration-500",
                                   isPast ? "bg-foreground" : isCurrent ? "bg-foreground animate-pulse" : "bg-border"
                                )} />
                                <div className={cn(
                                   "mt-2 text-[8px] font-bold uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis",
                                   isCurrent ? "text-foreground font-black" : "text-muted"
                                )}>{step}</div>
                             </div>
                           )
                        })}
                     </div>
                  </section>

                  {/* Context Cards */}
                  <section className="space-y-4">
                     <h3 className="text-[12px] font-bold text-foreground mb-0 flex items-center gap-2">
                        <Info className="h-4 w-4" /> Investigation Context
                     </h3>
                     <div className="card-enterprise p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted uppercase">Primary Asset</label>
                              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                 <Terminal className="h-4 w-4" />
                                 {selectedIncident.serviceName}
                              </div>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted uppercase">Ownership</label>
                              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                 <User className="h-4 w-4" />
                                 SRE-TEAM-ALPHA
                              </div>
                           </div>
                        </div>
                        <div className="p-4 bg-surface-alt border border-border rounded-lg">
                           <p className="text-[14px] leading-relaxed text-foreground font-medium italic">
                              "{selectedIncident.description}"
                           </p>
                        </div>
                     </div>
                  </section>

                  {/* Activity Log */}
                  <section className="space-y-4">
                     <h3 className="text-[12px] font-bold text-foreground mb-0 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Activity Stream
                     </h3>
                     <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                        <div className="relative pl-8">
                           <div className="absolute left-0 top-1 h-[22px] w-[22px] bg-background border border-border rounded-full flex items-center justify-center font-bold text-[8px]">AM</div>
                           <div className="text-[13px] font-black text-foreground">Incident declared by monitoring system</div>
                           <div className="text-[11px] text-secondary font-bold">Acknowledge response initiated in us-east-1.</div>
                           <div className="mt-1 text-[10px] font-black text-muted uppercase tracking-widest">10:42 AM</div>
                        </div>
                     </div>
                  </section>
               </div>

               <div className="px-8 py-6 border-t border-border bg-surface flex gap-3">
                  <button className="btn-secondary flex-1 h-10">
                     Internal Chat
                  </button>
                  <button className="btn-primary flex-1 h-10">
                     Update Operational State
                  </button>
               </div>
            </>
         )}
      </div>

      {/* Declare Incident Modal */}
      {isDeclareModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="card-enterprise w-full max-w-xl bg-surface shadow-2xl animate-in zoom-in-95">
              <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                 <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground m-0">Initiate Crisis Response</h2>
                    <p className="text-[12px] text-muted font-medium mb-0">Declarative signal for active platform breach or failure.</p>
                 </div>
                 <button onClick={() => setIsDeclareModalOpen(false)} className="p-2 hover:bg-surface-alt rounded-full transition-colors">
                    <X className="h-5 w-5" />
                 </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); declareMutation.mutate(declaration); }} className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="label-enterprise">Mission Critical Identifier</label>
                       <input 
                         required 
                         className="input-enterprise h-10 font-bold" 
                         placeholder="e.g. AUTH_SYSTEM_DOWN" 
                         value={declaration.title} 
                         onChange={e => setDeclaration({...declaration, title: e.target.value.toUpperCase()})} 
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="label-enterprise">Service Impacted</label>
                          <input required className="input-enterprise h-10" placeholder="api-gateway" value={declaration.serviceName} onChange={e => setDeclaration({...declaration, serviceName: e.target.value})} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="label-enterprise">Urgency Tier</label>
                          <select className="input-enterprise h-10 font-bold appearance-none cursor-pointer" value={declaration.severity} onChange={e => setDeclaration({...declaration, severity: e.target.value})}>
                             <option value="P1">P1 - CRITICAL</option>
                             <option value="P2">P2 - MAJOR</option>
                             <option value="P3">P3 - MINOR</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="label-enterprise">Tactical Briefing</label>
                       <textarea required className="input-enterprise h-24 py-3 leading-relaxed resize-none" placeholder="Provide immediate context for responding SREs..." value={declaration.description} onChange={e => setDeclaration({...declaration, description: e.target.value})} />
                    </div>
                 </div>
                 
                 <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={declareMutation.isPending}
                      className="w-full btn-primary h-11"
                    >
                       {declareMutation.isPending ? 'Syncing...' : 'Initiate Operational Command'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Floating Bulk Actions */}
      {bulkSelection.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground px-6 py-3 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-[1000] flex items-center gap-8 animate-in slide-in-from-bottom-5">
           <div className="flex items-center gap-3">
              <span className="h-6 w-6 bg-white text-black rounded-full flex items-center justify-center font-bold text-[11px]">{bulkSelection.length}</span>
              <div className="text-[12px] font-bold text-white uppercase tracking-wider">Signals Selected</div>
           </div>
           <div className="h-6 w-px bg-white/20" />
           <div className="flex items-center gap-5">
              <button onClick={() => { apiClient.bulkResolveIncidents(bulkSelection); setBulkSelection([]); toast.success('Triage complete.'); triggerCascadeSync(); }} className="text-[12px] font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-2">
                 <CheckCircle2 className="h-4 w-4" /> Resolve
              </button>
              <button onClick={() => setBulkSelection([])} className="text-[12px] font-bold text-white/50 hover:text-white transition-colors">
                 Deselect
              </button>
           </div>
        </div>
      )}
    </div>
  )
}

export default IncidentsPage
