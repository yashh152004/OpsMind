import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Clock, 
  ExternalLink, 
  Plus,
  Search,
  Download,
  Terminal,
  CheckCircle2,
  BrainCircuit,
  X,
  Filter,
  Users,
  Shield,
  Activity,
  AlertTriangle,
  ChevronRight,
  History,
  MessageSquare,
  Paperclip,
  Info
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
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [bulkSelection, setBulkSelection] = useState<number[]>([])

  // Declaration Form State
  const [declaration, setDeclaration] = useState({
    title: '',
    description: '',
    severity: 'P2',
    priority: 'HIGH',
    serviceName: '',
    environment: 'PRODUCTION',
    cluster: 'us-east-1',
    category: 'INFRA',
    impact: '',
    owner: 'system'
  })

  // Data Fetching
  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents', organizationId],
    queryFn: () => apiClient.getIncidents(organizationId || 'default'),
    refetchInterval: 10000
  })

  const { data: timeline, isLoading: isTimelineLoading } = useQuery({
    queryKey: ['incident-timeline', selectedIncident?.id],
    queryFn: () => apiClient.getIncidentTimeline(selectedIncident.id),
    enabled: !!selectedIncident && isDetailDrawerOpen
  })

  // Mutations
  const resolveMutation = useMutation({
    mutationFn: (id: number) => apiClient.updateIncidentStatus(id, 'RESOLVED', 'Resolved via Enterprise Console', 'admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      toast.success('Disruption mitigated. Status updated to RESOLVED.')
    }
  })

  const declareMutation = useMutation({
    mutationFn: (data: any) => apiClient.createIncident(organizationId || 'default', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      setIsDeclareModalOpen(false)
      toast.success('Incident declared. Notification streams triggered.')
      setDeclaration({
        title: '', description: '', severity: 'P2', priority: 'HIGH',
        serviceName: '', environment: 'PRODUCTION', cluster: 'us-east-1',
        category: 'INFRA', impact: '', owner: 'system'
      })
    }
  })

  // Handlers
  const openDetails = (incident: any) => {
    setSelectedIncident(incident)
    setIsDetailDrawerOpen(true)
  }

  const handleExport = async () => {
    try {
      const blob = await apiClient.exportModule('incidents');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OpsMind_Incident_Audit_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Audit data exported successfully.');
    } catch (err) {
      toast.error('Export engine failure.');
    }
  }

  const toggleBulk = (id: number) => {
    setBulkSelection(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const filteredIncidents = useMemo(() => {
    return incidents?.filter((i: any) => {
      const matchesSearch = (i.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             i.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesTab = activeTab === 'ALL' || i.status === activeTab
      return matchesSearch && matchesTab
    })
  }, [incidents, searchTerm, activeTab])

  return (
    <div className="main-content-grid page-transition-fade relative min-h-[calc(100vh-120px)]">
      {/* Sub-navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
           <h1 className="text-xl font-black text-primary tracking-tight italic">Incident Command</h1>
           <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-sm text-[9px] font-black uppercase tracking-widest">
                 Platform Latency: 42ms
              </div>
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Shard: global-ingress-01</span>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleExport} className="btn-secondary h-8 px-4 text-[10px] font-black uppercase tracking-widest group shadow-sm transition-all hover:shadow-md">
              <Download className="h-3.5 w-3.5 mr-2 group-hover:translate-y-0.5 transition-transform" /> Export Data
           </button>
           <button onClick={() => setIsDeclareModalOpen(true)} className="btn-primary h-8 px-5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 italic group">
              <Plus className="h-3.5 w-3.5 mr-2 group-hover:rotate-90 transition-transform" /> Declare Incident
           </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="grid lg:grid-cols-[1fr,auto] gap-4 items-center">
         <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'OPEN', 'INVESTIGATING', 'MONITORING', 'RESOLVED'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all whitespace-nowrap",
                  activeTab === tab ? "bg-[#0F172A] text-white shadow-lg" : "text-muted hover:bg-slate-100"
                )}
              >
                {tab}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-2">
            <div className="relative group min-w-[320px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted group-focus-within:text-accent transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search Reference, Cluster, or Service..." 
                 className="input-field pl-9 h-10 border-slate-200 focus:border-accent shadow-sm" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <button className="btn-secondary h-10 w-10 p-0 flex items-center justify-center hover:bg-slate-50 border-slate-200 shadow-sm">
               <Filter className="h-4 w-4" />
            </button>
         </div>
      </div>

      {/* Main Grid View */}
      <div className="enterprise-table-container shadow-2xl border-slate-200">
         <table className="enterprise-table">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="w-12 text-center">
                     <input type="checkbox" className="rounded-sm border-slate-300" />
                  </th>
                  <th className="w-24">Ref ID</th>
                  <th>Incident Context & Signal</th>
                  <th className="w-24">Tier</th>
                  <th className="w-28 text-center">Operational</th>
                  <th className="w-40">Environment</th>
                  <th className="w-28 text-right">Age</th>
                  <th className="w-16"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={8} className="py-6"><div className="h-5 bg-slate-50 animate-pulse rounded-sm w-full" /></td></tr>
                  ))
               ) : filteredIncidents?.map((incident: any) => (
                  <tr key={incident.id} onClick={() => openDetails(incident)} className="group hover:bg-slate-50/80 cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-accent">
                     <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={bulkSelection.includes(incident.id)} 
                          onChange={() => toggleBulk(incident.id)}
                          className="rounded-sm border-slate-300" 
                        />
                     </td>
                     <td>
                        <span className="font-mono text-[10px] font-black text-secondary tracking-widest bg-slate-100 px-1.5 py-0.5 rounded-[2px]">
                           #{incident.id.toString().padStart(4, '0')}
                        </span>
                     </td>
                     <td>
                        <div className="flex flex-col gap-0.5">
                           <div className="text-[13px] font-black text-primary group-hover:text-accent transition-colors flex items-center gap-2">
                              {incident.title}
                              {incident.priority === 'HIGHEST' && <AlertTriangle className="h-3 w-3 text-critical" />}
                           </div>
                           <div className="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                              <Terminal className="h-3 w-3 text-muted/30" /> {incident.serviceName} • {incident.category}
                           </div>
                        </div>
                     </td>
                     <td>
                        <span className={cn(
                          "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                          incident.severity === 'P1' ? "bg-red-50 text-red-600 border-red-100" :
                          incident.severity === 'P2' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
                        )}>
                           {incident.severity}
                        </span>
                     </td>
                     <td className="text-center">
                        <div className="flex flex-col items-center gap-1">
                           <span className={cn(
                             "h-1.5 w-1.5 rounded-full",
                             incident.status === 'RESOLVED' ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                           )} />
                           <span className="text-[9px] font-black text-muted uppercase tracking-tighter">{incident.status}</span>
                        </div>
                     </td>
                     <td>
                        <div className="flex items-center gap-2">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{incident.environment}</span>
                              <span className="text-[9px] text-muted font-medium">{incident.cluster || 'global'}</span>
                           </div>
                        </div>
                     </td>
                     <td className="text-right">
                        <span className="text-[11px] font-bold text-muted font-mono uppercase">
                           {new Date(incident.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </td>
                     <td className="text-right">
                        <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Incident Detail Drawer */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-[600px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[500] border-l border-slate-200 transform transition-transform duration-500 ease-out flex flex-col",
        isDetailDrawerOpen ? "translate-x-0" : "translate-x-full"
      )}>
         {selectedIncident && (
           <>
              {/* Drawer Header */}
              <div className="p-6 border-b border-border bg-slate-50 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-[2px] flex items-center justify-center text-white font-black text-xs italic">
                       OP
                    </div>
                    <div>
                       <div className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5">
                          <Shield className="h-3 w-3" /> Incident Control • #{selectedIncident.id}
                       </div>
                       <h2 className="text-lg font-black text-primary tracking-tight line-clamp-1">{selectedIncident.title}</h2>
                    </div>
                 </div>
                 <button onClick={() => setIsDetailDrawerOpen(false)} className="text-muted hover:text-primary p-2 hover:bg-white rounded-full transition-all">
                    <X className="h-6 w-6" />
                 </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto scrollbar-slim p-8 space-y-10">
                 {/* Top Level KPIs */}
                 <div className="grid grid-cols-3 gap-6 border-b border-slate-100 pb-8">
                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-muted uppercase tracking-widest flex items-center gap-1">
                          <Activity className="h-3 w-3" /> Operational Tier
                       </div>
                       <div className="text-lg font-black text-primary">{selectedIncident.severity}</div>
                    </div>
                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-muted uppercase tracking-widest flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Time to Resolve
                       </div>
                       <div className="text-lg font-black text-emerald-600">--:--</div>
                    </div>
                    <div className="space-y-1">
                       <div className="text-[9px] font-black text-muted uppercase tracking-widest flex items-center gap-1">
                          <Users className="h-3 w-3" /> Current Owner
                       </div>
                       <div className="text-xs font-black text-accent uppercase tracking-widest py-1">{selectedIncident.assignedTo || 'UNASSIGNED'}</div>
                    </div>
                 </div>

                 {/* Signal Context */}
                 <section className="space-y-4">
                    <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 italic">
                       <Info className="h-4 w-4 text-accent" /> Ingress Signals
                    </h3>
                    <div className="enterprise-card p-6 bg-slate-50/50 space-y-6">
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                             <div className="text-[9px] font-black text-muted uppercase tracking-widest">Environment Target</div>
                             <div className="text-xs font-bold text-secondary uppercase">{selectedIncident.environment} / {selectedIncident.cluster}</div>
                          </div>
                          <div className="space-y-1">
                             <div className="text-[9px] font-black text-muted uppercase tracking-widest">Target Service</div>
                             <div className="text-xs font-bold text-secondary uppercase">{selectedIncident.serviceName}</div>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="text-[9px] font-black text-muted uppercase tracking-widest">Incident Context & Impact</div>
                          <p className="text-[13px] font-medium text-secondary leading-relaxed bg-white p-3 border border-slate-200 rounded-sm">
                             {selectedIncident.description}
                          </p>
                       </div>
                    </div>
                 </section>

                 {/* Timeline */}
                 <section className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 italic">
                          <History className="h-4 w-4 text-accent" /> Operational Timeline
                       </h3>
                       <span className="text-[9px] font-black text-muted uppercase tracking-widest">Updated 2m ago</span>
                    </div>
                    <div className="relative pl-6 space-y-8 border-l border-slate-200 ml-4 py-2">
                       {isTimelineLoading ? (
                         <div className="text-xs text-muted font-bold italic uppercase">Syncing timeline stream...</div>
                       ) : timeline?.map((event: any, i: number) => (
                         <div key={i} className="relative">
                            <div className="absolute -left-[31px] top-0.5 h-2 w-2 rounded-full border-2 border-white bg-accent shadow-[0_0_0_4px_rgba(37,99,235,0.1)]" />
                            <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">
                               {new Date(event.timestamp).toLocaleTimeString()} • {event.operator}
                            </div>
                            <div className="text-[12px] font-bold text-primary mb-1 underline decoration-accent/30 decoration-2 underline-offset-4">{event.eventType}</div>
                            <p className="text-[11px] text-secondary font-medium leading-relaxed italic">{event.content}</p>
                         </div>
                       ))}
                       {/* Declaration Marker */}
                       <div className="relative">
                          <div className="absolute -left-[31px] top-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" />
                          <div className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">
                             {new Date(selectedIncident.createdAt).toLocaleTimeString()} • system
                          </div>
                          <div className="text-[12px] font-bold text-primary">INITIAL_DETECTION</div>
                       </div>
                    </div>
                 </section>

                 {/* Evidence & Artifacts */}
                 <section className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 italic">
                          <Paperclip className="h-4 w-4 text-accent" /> Evidence & Artifacts
                       </h3>
                       <button className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline">Upload Artifact</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-3 border border-dashed border-slate-300 rounded-sm hover:bg-slate-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 h-24 group">
                          <Plus className="h-5 w-5 text-slate-300 group-hover:text-accent group-hover:rotate-90 transition-all" />
                          <span className="text-[9px] font-black text-muted uppercase tracking-widest">Attach Screenshot/Log</span>
                       </div>
                       {/* Mock uploaded file */}
                       <div className="p-3 border border-slate-200 rounded-sm hover:shadow-md transition-all flex flex-col justify-between h-24 bg-white relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                             <ExternalLink className="h-3 w-3 text-muted hover:text-accent" />
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="h-8 w-8 bg-blue-50 rounded-sm flex items-center justify-center text-accent">
                                <Terminal className="h-4 w-4" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-primary truncate w-24">logs_shard_A.txt</span>
                                <span className="text-[8px] text-muted font-medium uppercase tracking-widest text-[8px]">LOG • 1.2MB</span>
                             </div>
                          </div>
                          <div className="text-[8px] font-black text-muted uppercase tracking-widest border-t border-slate-50 pt-2 flex items-center justify-between">
                             <span>Uploaded 12m ago</span>
                             <span className="text-emerald-500">SECURE</span>
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* AI Insights & Reasoning */}
                 <section className="space-y-4">
                    <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 italic">
                       <BrainCircuit className="h-4 w-4 text-accent" /> AI SRE Reasoning
                    </h3>
                    <div className="bg-[#0F172A] p-6 rounded-[2px] border border-slate-700 shadow-2xl space-y-4 font-mono">
                        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                           <div className="h-6 w-6 bg-accent rounded-full flex items-center justify-center animate-pulse">
                              <BrainCircuit className="h-3 h-3 text-white" />
                           </div>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Predictive Pattern Matrix</span>
                        </div>
                        <div className="space-y-3">
                           <div className="text-[11px] text-slate-300 leading-relaxed italic">
                              <span className="text-accent underline">Observation:</span> Analyzing recent deployments... Deployment ID <span className="text-emerald-400">#v4.2.9-ingress</span> in cluster-alpha matches current disruption pattern with <span className="text-emerald-400 font-black">94.2%</span> confidence.
                           </div>
                           <div className="grid grid-cols-2 gap-4 pt-2">
                              <div className="p-3 bg-slate-900 border border-slate-800 space-y-1">
                                 <div className="text-[8px] text-slate-500 uppercase font-black">Root Cause Proxy</div>
                                 <div className="text-[11px] text-white font-bold">Latency Spike / DB-Shard</div>
                              </div>
                              <div className="p-3 bg-slate-900 border border-slate-800 space-y-1">
                                 <div className="text-[8px] text-slate-500 uppercase font-black">Success Confidence</div>
                                 <div className="text-[11px] text-emerald-400 font-bold">88.5% High</div>
                              </div>
                           </div>
                        </div>
                    </div>
                 </section>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4 shrink-0">
                 <button 
                   onClick={() => navigate('/ai-chat', { state: { initialMessage: `/analyze incident ${selectedIncident.id}` } })}
                   className="btn-secondary h-11 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                 >
                    <MessageSquare className="h-4 w-4" /> AI Analysis
                 </button>
                 <button 
                   disabled={selectedIncident.status === 'RESOLVED' || resolveMutation.isPending}
                   onClick={() => resolveMutation.mutate(selectedIncident.id)}
                   className="btn-primary h-11 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-200 bg-emerald-600 hover:bg-emerald-700 border-none italic"
                 >
                    {resolveMutation.isPending ? 'Propagating...' : 'Acknowledge & Resolve'}
                 </button>
              </div>
           </>
         )}
      </div>

      {/* Backdrop for Drawer */}
      {isDetailDrawerOpen && (
        <div 
          className="fixed inset-0 bg-primary/20 backdrop-blur-[1px] z-[450] animate-in fade-in duration-300"
          onClick={() => setIsDetailDrawerOpen(false)}
        />
      )}

      {/* Incident Declaration Full-Scale Modal */}
      {isDeclareModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white border border-border w-full max-w-2xl rounded shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border bg-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary rounded-[2px] flex items-center justify-center text-white">
                       <Plus className="h-5 w-5" />
                    </div>
                    <div>
                       <h2 className="text-sm font-black uppercase tracking-widest text-primary">Declare Major Incident</h2>
                       <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Initialize cross-team orchestration stream</p>
                    </div>
                 </div>
                 <button onClick={() => setIsDeclareModalOpen(false)} className="text-muted hover:text-critical transition-colors"><X className="h-5 w-5" /></button>
              </div>
              
              <div className="p-8 grid md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto scrollbar-slim">
                 {/* Left Column: Core Identity */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] block">Incident Command Title</label>
                       <input 
                         required 
                         className="input-field h-11 font-bold" 
                         placeholder="e.g. CORE-DB-SATURATION" 
                         value={declaration.title} 
                         onChange={e => setDeclaration({...declaration, title: e.target.value})} 
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Severity Tier</label>
                          <select className="input-field h-11 cursor-pointer font-bold" value={declaration.severity} onChange={e => setDeclaration({...declaration, severity: e.target.value})}>
                             <option value="P1">P1 - Critical</option>
                             <option value="P2">P2 - Major</option>
                             <option value="P3">P3 - Minor</option>
                             <option value="P4">P4 - Low</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Priority</label>
                          <select className="input-field h-11 cursor-pointer font-bold" value={declaration.priority} onChange={e => setDeclaration({...declaration, priority: e.target.value})}>
                             <option value="HIGHEST">HIGHEST</option>
                             <option value="HIGH">HIGH</option>
                             <option value="LOW">LOW</option>
                          </select>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Blast Radius / Impact</label>
                       <textarea 
                         required 
                         className="input-field h-24 resize-none font-medium leading-relaxed" 
                         placeholder="Which users or subsystems are currently degraded?" 
                         value={declaration.impact} 
                         onChange={e => setDeclaration({...declaration, impact: e.target.value})} 
                       />
                    </div>
                 </div>

                 {/* Right Column: Infrastructure Context */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Affected Microservice</label>
                       <input 
                         required 
                         className="input-field h-11 font-bold" 
                         placeholder="e.g. auth-gateway-v1" 
                         value={declaration.serviceName} 
                         onChange={e => setDeclaration({...declaration, serviceName: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Environment Shard</label>
                       <select className="input-field h-11 cursor-pointer font-bold" value={declaration.environment} onChange={e => setDeclaration({...declaration, environment: e.target.value})}>
                          <option value="PRODUCTION">PRODUCTION</option>
                          <option value="STAGING">STAGING</option>
                          <option value="UAT">UAT / QA</option>
                       </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Classification</label>
                          <select className="input-field h-11 cursor-pointer font-bold" value={declaration.category} onChange={e => setDeclaration({...declaration, category: e.target.value})}>
                             <option value="INFRA">INFRASTRUCTURE</option>
                             <option value="APP">APPLICATION</option>
                             <option value="SECURITY">SECURITY</option>
                             <option value="NETWORK">NETWORK</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Cluster ID</label>
                          <input 
                            className="input-field h-11 font-bold" 
                            placeholder="e.g. us-east-1" 
                            value={declaration.cluster} 
                            onChange={e => setDeclaration({...declaration, cluster: e.target.value})} 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Narrative Context</label>
                       <textarea 
                         required 
                         className="input-field h-24 resize-none font-medium leading-relaxed" 
                         placeholder="Internal technical details for the response squad..." 
                         value={declaration.description} 
                         onChange={e => setDeclaration({...declaration, description: e.target.value})} 
                       />
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-border flex items-center justify-between">
                 <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Notification blast will trigger upon confirmation</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setIsDeclareModalOpen(false)} className="btn-secondary h-11 px-8 text-[10px] font-black uppercase tracking-widest">Discard</button>
                    <button 
                      onClick={() => declareMutation.mutate(declaration)}
                      disabled={declareMutation.isPending}
                      className="btn-primary h-11 px-10 text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-accent/20"
                    >
                       {declareMutation.isPending ? 'Provisioning...' : 'Initiate Command'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Floating Action Bar for Bulk Selection */}
      {bulkSelection.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-primary px-8 py-4 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[1000] flex items-center gap-8 animate-in slide-in-from-bottom-10 duration-500 border border-secondary">
           <div className="flex items-center gap-4 border-r border-secondary pr-8">
              <span className="h-8 w-8 bg-accent text-white rounded-full flex items-center justify-center font-black text-xs">{bulkSelection.length}</span>
              <div className="text-[11px] font-black text-white uppercase tracking-widest">Entities Selected</div>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => { apiClient.bulkResolveIncidents(bulkSelection); setBulkSelection([]); toast.success('Bulk resolution triggered'); queryClient.invalidateQueries({ queryKey:['incidents'] }); }} className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors flex items-center gap-2">
                 <CheckCircle2 className="h-4 w-4" /> Resolve Selection
              </button>
              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                 <Users className="h-4 w-4" /> Assign Squad
              </button>
              <button onClick={() => setBulkSelection([])} className="text-[10px] font-black text-critical uppercase tracking-widest hover:text-red-400 transition-colors">Abort</button>
           </div>
        </div>
      )}
    </div>
  )
}

export default IncidentsPage
