import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Plus, Search, Download, Terminal, CheckCircle2, X, Activity, AlertTriangle, 
  ChevronRight, History, MessageSquare, Info, ChevronDown, RefreshCcw, 
  Clock, MapPin, User, Shield
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
    <div className="page-transition-fade space-y-6 p-6 lg:p-8 bg-background min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-border">
        <div className="space-y-1 text-left">
           <h1 className="text-[32px] font-bold tracking-tight text-foreground m-0 leading-tight">Identity & Incidents</h1>
           <div className="flex items-center gap-2.5">
              <span className="badge-enterprise bg-surface-alt text-foreground border-border py-0.5">
                 <Shield className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                 Active Control
              </span>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                 <Activity className="h-3.5 w-3.5 text-emerald-500" /> Triage Room Active
              </p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleExport} className="btn-secondary h-8.5 px-3">
              <Download className="h-4 w-4" />
              <span>Export Audit</span>
           </button>
           <button onClick={() => setIsDeclareModalOpen(true)} className="btn-primary h-8.5 px-3">
              <Plus className="h-4 w-4" />
              <span>Declare Incident</span>
           </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
         <div className="flex items-center gap-1 p-1 bg-surface-alt rounded-[var(--radius)] border border-border self-start">
            {['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'].map(tab => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setPage(0); }}
                className={cn(
                  "px-3.5 py-1 text-[12px] font-[500] rounded-[var(--radius)] transition-all",
                  activeTab === tab ? "bg-background text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-2 flex-1 lg:max-w-md w-full">
            <div className="relative w-full group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search by ID, title, or service..." 
                 className="input-enterprise pl-9 w-full h-8.5" 
                 value={searchTerm}
                 onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
               />
            </div>
            <button onClick={() => refetch()} className="btn-secondary h-8.5 w-8.5 p-0 flex items-center justify-center">
               <RefreshCcw className={cn("h-3.5 w-3.5", isRefetching && "animate-spin")} />
            </button>
         </div>
      </div>

      {/* Main Grid */}
      <div className="table-container">
         <table className="table-enterprise">
            <thead>
               <tr>
                  <th className="w-10 text-center">
                     <input type="checkbox" className="rounded-[4px] border-border-strong h-3.5 w-3.5 cursor-pointer accent-foreground bg-surface" />
                  </th>
                  <th className="w-24">Ref ID</th>
                  <th>Incident Context</th>
                  <th className="w-24 text-center">Severity</th>
                  <th className="w-32 text-center">Lifecycle</th>
                  <th className="w-40 text-right">Last Signal</th>
                  <th className="w-8"></th>
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
                        <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <div className="text-[13px] font-bold text-foreground mb-1">Clear Skies</div>
                        <p className="text-[12px] text-muted-foreground">No active incidents matching your current filters.</p>
                     </td>
                  </tr>
               ) : incidents.map((incident: any) => (
                  <tr key={incident.id} 
                      onClick={() => { setSelectedIncident(incident); setIsDetailDrawerOpen(true); }} 
                      className="group cursor-pointer hover:bg-surface-hover transition-colors border-l-2 border-l-transparent hover:border-l-foreground">
                     <td className="text-center" onClick={e => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={bulkSelection.includes(incident.id)}
                          onChange={() => setBulkSelection(prev => prev.includes(incident.id) ? prev.filter(id => id !== incident.id) : [...prev, incident.id])}
                          className="rounded-[4px] border-border-strong h-3.5 w-3.5 cursor-pointer accent-foreground bg-surface" 
                        />
                     </td>
                     <td>
                        <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-surface-alt px-1.5 py-0.5 rounded border border-border">
                           #{incident.id.toString().padStart(4, '0')}
                        </span>
                     </td>
                     <td className="py-3.5">
                        <div className="flex flex-col gap-0.5 text-left">
                           <div className="text-[14px] font-semibold text-foreground group-hover:underline">
                              {incident.title}
                           </div>
                           <div className="text-[11px] text-muted-foreground font-normal flex items-center gap-1.5">
                              <span className="text-foreground/90 font-medium">{incident.serviceName}</span>
                              <span className="text-border">|</span>
                              <span>{incident.cluster || 'us-east-1'}</span>
                           </div>
                        </div>
                     </td>
                     <td className="text-center">
                        <span className={cn(
                          "badge-enterprise",
                          incident.severity === 'P0' || incident.severity === 'P1' ? "badge-critical" : 
                          incident.severity === 'P2' ? "badge-warning" : "badge-info"
                        )}>{incident.severity}</span>
                     </td>
                     <td>
                        <div className="flex flex-col items-center gap-1">
                           <div className={cn("h-1.5 w-1.5 rounded-full", 
                              incident.status === 'RESOLVED' ? "bg-emerald-500" : 
                              incident.status === 'OPEN' ? "bg-red-500 animate-pulse" : "bg-amber-500"
                           )} />
                           <span className="text-[10px] font-bold text-foreground/80 uppercase tracking-widest leading-none mt-0.5">{incident.status}</span>
                        </div>
                     </td>
                     <td className="text-right pointer-events-none">
                        <div className="text-[12px] text-muted-foreground font-medium">
                           {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                     </td>
                     <td className="text-center">
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-100" />
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>

         {/* Pagination */}
         {pageData && pageData.totalPages > 1 && (
            <div className="px-5 py-3 bg-surface-alt/50 border-t border-border flex items-center justify-between">
               <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Page {page + 1} of {pageData.totalPages}
               </div>
               <div className="flex gap-1.5">
                  <button 
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="btn-secondary h-8 px-2.5 text-[12px]"
                  >Previous</button>
                  <button 
                    disabled={page >= pageData.totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="btn-secondary h-8 px-2.5 text-[12px]"
                  >Next</button>
               </div>
            </div>
         )}
      </div>

      {/* Incident Detail Drawer */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full max-w-[550px] bg-surface shadow-[0_0_50px_rgba(0,0,0,0.15)] z-[500] border-l border-border transform transition-transform duration-300 ease-in-out flex flex-col",
        isDetailDrawerOpen ? "translate-x-0" : "translate-x-full"
      )}>
         {selectedIncident && (
            <>
               <div className="px-6 py-4.5 border-b border-border bg-surface-alt flex items-center justify-between">
                  <div className="space-y-1 text-left">
                     <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[10px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded">INC-{selectedIncident.id}</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-border" />
                        <span className="text-[10px] font-black text-muted-foreground tracking-wider uppercase">{selectedIncident.category || 'SYSTEM'}</span>
                     </div>
                     <h2 className="text-[18px] font-bold text-foreground leading-tight">{selectedIncident.title}</h2>
                  </div>
                  <button onClick={() => setIsDetailDrawerOpen(false)} className="p-1.5 hover:bg-surface-hover rounded-full transition-colorsClose">
                     <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                  {/* Status Bar */}
                  <div className="grid grid-cols-2 gap-6 pb-2 text-left">
                     <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Severity Class</label>
                        <div className="flex items-center gap-1.5">
                           <div className={cn("h-2.5 w-2.5 rounded-full", selectedIncident.severity === 'P1' ? "bg-red-500" : "bg-amber-500")} />
                           <span className="text-[13px] font-semibold text-foreground uppercase">{selectedIncident.severity} RESPONSE</span>
                        </div>
                     </div>
                     <div className="space-y-1 text-right">
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Environment</label>
                        <div className="flex items-center gap-1.5 justify-end">
                           <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                           <span className="text-[13px] font-semibold text-foreground uppercase tracking-tight">{selectedIncident.environment || 'PRODUCTION'} / {selectedIncident.cluster || 'us-east-1'}</span>
                        </div>
                     </div>
                  </div>

                  {/* Progressive Lifecycle */}
                  <section className="space-y-3 border-t border-border pt-4 text-left">
                     <div className="flex items-center justify-between">
                        <h3 className="text-[12px] font-bold text-foreground m-0 flex items-center gap-1.5">
                           <History className="h-4 w-4 text-muted-foreground" /> Signal Progression
                        </h3>
                        <span className="text-[11px] font-normal text-muted-foreground italic">MTTR Expect: 45m</span>
                     </div>
                     <div className="flex items-center gap-1.5 mt-1.5">
                        {lifecycle.map((step, idx) => {
                           const isCurrent = selectedIncident.status === step;
                           const isPast = lifecycle.indexOf(selectedIncident.status) > idx;
                           return (
                              <div key={step} className="flex-1">
                                 <div className={cn(
                                    "h-1 rounded-full transition-all duration-300",
                                    isPast ? "bg-foreground" : isCurrent ? "bg-foreground animate-pulse" : "bg-border"
                                 )} />
                                 <div className={cn(
                                    "mt-1.5 text-[8px] font-bold uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis text-center",
                                    isCurrent ? "text-foreground" : "text-muted-foreground"
                                 )}>{step}</div>
                              </div>
                           )
                        })}
                     </div>
                  </section>

                  {/* Context Cards */}
                  <section className="space-y-3 border-t border-border pt-4 text-left">
                     <h3 className="text-[12px] font-bold text-foreground m-0 flex items-center gap-1.5">
                        <Info className="h-4 w-4 text-muted-foreground" /> Investigation Context
                     </h3>
                     <div className="card-enterprise p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-0.5">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Service Focus</label>
                              <div className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                                 <Terminal className="h-4 w-4 text-muted-foreground" />
                                 {selectedIncident.serviceName}
                              </div>
                           </div>
                           <div className="space-y-0.5">
                              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Sustained Owner</label>
                              <div className="text-[13px] font-semibold text-foreground flex items-center gap-1.5">
                                 <User className="h-4 w-4 text-muted-foreground" />
                                 SRE-TEAM-ALPHA
                              </div>
                           </div>
                        </div>
                        <div className="p-3 bg-surface-alt border border-border rounded-[var(--radius)]">
                           <p className="text-[13px] leading-relaxed text-foreground font-normal italic">
                              "{selectedIncident.description}"
                           </p>
                        </div>
                     </div>
                  </section>

                  {/* Activity Log */}
                  <section className="space-y-3 border-t border-border pt-4 text-left">
                     <h3 className="text-[12px] font-bold text-foreground m-0 flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" /> Actions & Timelines
                     </h3>
                     <div className="space-y-4 relative pl-5.5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                        <div className="relative">
                           <div className="absolute -left-[23px] top-0 h-4.5 w-4.5 bg-foreground text-background border border-border rounded-full flex items-center justify-center font-bold text-[8px]">SA</div>
                           <div className="text-[13px] font-semibold text-foreground">Operational signal detected</div>
                           <div className="text-[12px] text-muted-foreground">Triage policy declared under {selectedIncident.serviceName} in US clusters.</div>
                           <div className="mt-1 text-[10px] font-medium text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(selectedIncident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                     </div>
                  </section>
               </div>

               <div className="px-6 py-4 border-t border-border bg-surface flex gap-3.5">
                  <button className="btn-secondary flex-1 h-9.5">
                     Internal Chat
                  </button>
                  <button className="btn-primary flex-1 h-9.5">
                     Update Operational State
                  </button>
               </div>
            </>
         )}
      </div>

      {/* Declare Incident Modal */}
      {isDeclareModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
           <div className="card-enterprise w-full max-w-lg bg-surface shadow-2xl animate-in zoom-in-95">
              <div className="px-6 py-4.5 border-b border-border flex items-center justify-between">
                 <div className="space-y-0.5 text-left">
                    <h2 className="text-[18px] font-bold text-foreground m-0">Initiate Crisis Response</h2>
                    <p className="text-[12px] text-muted-foreground font-normal mb-0">Declarative signal for active platform breach or failure.</p>
                 </div>
                 <button onClick={() => setIsDeclareModalOpen(false)} className="p-1.5 hover:bg-surface-hover rounded-full transition-colors">
                    <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                 </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); declareMutation.mutate(declaration); }} className="p-6 space-y-5 text-left">
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="label-enterprise">Mission Critical Identifier</label>
                       <input 
                         required 
                         className="input-enterprise h-9.5 font-medium" 
                         placeholder="e.g. AUTH_SYSTEM_DOWN" 
                         value={declaration.title} 
                         onChange={e => setDeclaration({...declaration, title: e.target.value.toUpperCase()})} 
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                       <div className="space-y-1.5">
                          <label className="label-enterprise">Service Impacted</label>
                          <input required className="input-enterprise h-9.5" placeholder="api-gateway" value={declaration.serviceName} onChange={e => setDeclaration({...declaration, serviceName: e.target.value})} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="label-enterprise">Urgency Tier</label>
                          <select className="select-field h-9.5 font-medium cursor-pointer" value={declaration.severity} onChange={e => setDeclaration({...declaration, severity: e.target.value})}>
                             <option value="P1">P1 - CRITICAL</option>
                             <option value="P2">P2 - MAJOR</option>
                             <option value="P3">P3 - MINOR</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="label-enterprise">Tactical Briefing</label>
                       <textarea required className="input-enterprise h-20 py-2 leading-normal resize-none" placeholder="Provide context for responding SREs..." value={declaration.description} onChange={e => setDeclaration({...declaration, description: e.target.value})} />
                    </div>
                 </div>
                 
                 <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={declareMutation.isPending}
                      className="w-full btn-primary h-10 text-[14px]"
                    >
                       {declareMutation.isPending ? 'Syncing...' : 'Initiate Operational Command'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Floating Bulk Actions - Hardened color palette to prevent white-on-white text */}
      {bulkSelection.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700/80 px-5 py-2.5 rounded-[var(--radius)] shadow-[0_12px_40px_rgba(0,0,0,0.5)] z-[1000] flex items-center gap-6 animate-fade-in text-white">
           <div className="flex items-center gap-2">
              <span className="h-5.5 w-5.5 bg-white text-black rounded-full flex items-center justify-center font-bold text-[11px]">{bulkSelection.length}</span>
              <div className="text-[12px] font-bold uppercase tracking-wider text-white">Selected</div>
           </div>
           <div className="h-5 w-px bg-neutral-700" />
           <div className="flex items-center gap-4">
              <button onClick={() => { apiClient.bulkResolveIncidents(bulkSelection); setBulkSelection([]); toast.success('Triage complete.'); triggerCascadeSync(); }} className="text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                 <CheckCircle2 className="h-4 w-4" /> Resolve
              </button>
              <button onClick={() => setBulkSelection([])} className="text-[12px] font-semibold text-neutral-400 hover:text-white transition-colors">
                 Cancel
              </button>
           </div>
        </div>
      )}
    </div>
  )
}

export default IncidentsPage
