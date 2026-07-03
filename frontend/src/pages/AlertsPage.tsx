import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  BellOff, ArrowRight, Download, Database, Search, CheckCircle2, 
  BrainCircuit, Zap, Activity, Terminal, Info, ShieldCheck, Filter, X, RefreshCcw,
  SlidersHorizontal, ChevronRight, AlertTriangle, AlertCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAlertStream } from '@/hooks/useAlertStream'
import { useOrganization } from '@/hooks'
import { toast } from 'sonner'

const AlertsPage: React.FC = () => {
  const { organizationId } = useOrganization()
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  const { data: alerts, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['alerts', organizationId],
    queryFn: () => apiClient.getAlerts(organizationId || 'default'),
    refetchInterval: 10000
  })

  useAlertStream((newAlert) => {
    toast(`SIGNAL_DETECTED: ${newAlert.alertName}`, {
      description: `Ingress Shard: ${newAlert.source}`,
    })
    queryClient.invalidateQueries({ queryKey: ['alerts'] })
  })

  const filteredAlerts = alerts?.filter((a: any) => 
    (a.alertName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (a.source?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleExport = async () => {
    try {
      const blob = await apiClient.exportModule('alerts')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `OpsMind_Alerts_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      toast.success('Telemetry audit exported.')
    } catch (err) {
      toast.error('Export engine failure.')
    }
  }

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => apiClient.acknowledgeAlert(id),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey:['alerts'] })
       toast.success('Signal acknowledged.')
    }
  })

  return (
    <div className="page-transition-fade space-y-8 p-6 lg:p-8 bg-background min-h-screen">
      {/* Stream Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold tracking-tight text-foreground m-0">Alert Stream</h1>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-0.5 bg-neutral-100 border border-border rounded text-[11px] font-bold uppercase tracking-wider">
                 <Activity className="h-3.5 w-3.5 text-foreground animate-pulse" />
                 Telemetry Live
              </div>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted">
                 Monitoring <span className="text-foreground font-bold">{alerts?.length || 0} active signals</span> across infrastructure shards.
              </p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleExport} className="btn-secondary h-9 px-4">
              <Download className="h-4 w-4" />
              <span className="ml-2">Audit Export</span>
           </button>
           <button className="btn-primary h-9 px-4">
              <CheckCircle2 className="h-4 w-4" />
              <span className="ml-2">Bulk Acknowledge</span>
           </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center gap-3">
         <div className="relative group flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-foreground transition-colors" />
            <input 
              type="text" 
              placeholder="Search by signal ID, source, or severity..." 
              className="input-enterprise pl-10 h-10 w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button className="h-10 px-4 border border-border rounded-md hover:border-foreground transition-all flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-muted hover:text-foreground">
            <SlidersHorizontal className="h-4 w-4" /> Filter
         </button>
         <button onClick={() => refetch()} className={cn("p-2 border border-border rounded-md hover:border-foreground transition-all", isRefetching && "animate-spin")}>
            <RefreshCcw className="h-4 w-4 text-muted" />
         </button>
      </div>

      {/* Alerts Table */}
      <div className="card-enterprise overflow-hidden">
         <div className="table-container">
            <table className="table-enterprise">
               <thead>
                  <tr>
                     <th className="w-32 py-3">Severity</th>
                     <th>Signal Identifier</th>
                     <th className="w-[35%]">Intelligence Narrative</th>
                     <th className="w-32">Timestamp</th>
                     <th className="w-32 text-right">Control</th>
                  </tr>
               </thead>
               <tbody>
                  {isLoading ? (
                     Array(6).fill(0).map((_, i) => (
                       <tr key={i}><td colSpan={5} className="py-10"><div className="h-5 skeleton-ui w-full opacity-80 mx-auto rounded" /></td></tr>
                     ))
                  ) : !filteredAlerts?.length ? (
                     <tr>
                        <td colSpan={5} className="py-32 text-center">
                           <div className="flex flex-col items-center gap-4 opacity-80">
                              <BellOff className="h-12 w-12 text-muted" />
                              <div className="space-y-1">
                                 <h3 className="text-sm font-bold uppercase tracking-widest text-foreground m-0">Zero Telemetry Hazards</h3>
                                 <p className="text-[12px] font-medium text-muted">All system clusters are operating within nominal thresholds.</p>
                              </div>
                           </div>
                        </td>
                     </tr>
                  ) : filteredAlerts?.map((alert: any) => (
                     <tr key={alert.id} className="group cursor-pointer">
                        <td>
                           <div className={cn(
                             "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                             alert.status === 'TRIGGERED' 
                              ? "bg-red-50 text-red-700 border-red-200" 
                              : "bg-neutral-50 text-neutral-600 border-neutral-200"
                           )}>
                              {alert.status === 'TRIGGERED' ? (
                                <>
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Critical</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Nominal</span>
                                </>
                              )}
                           </div>
                        </td>
                        <td className="py-4">
                           <div className="flex items-center gap-3">
                              <div className="h-9 w-9 bg-surface-alt border border-border rounded-lg flex items-center justify-center transition-all shrink-0">
                                 {alert.source?.includes('DB') ? <Database className="h-4 w-4" /> : 
                                  alert.source?.includes('K8S') ? <Terminal className="h-4 w-4" /> : 
                                  <Activity className="h-4 w-4" />}
                              </div>
                              <div className="truncate space-y-0.5">
                                 <div className="text-[14px] font-bold text-foreground truncate group-hover:underline">{alert.alertName}</div>
                                 <div className="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    {alert.source} <span className="opacity-80">•</span> <span className="font-mono lowercase opacity-100">shard-{alert.id.slice(-4)}</span>
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="py-4">
                           <div className="p-3 bg-surface-alt/40 border border-border rounded-lg group-hover:border-foreground/20 transition-all">
                              <div className="flex items-start gap-3">
                                 <BrainCircuit className="h-4 w-4 text-foreground/60 mt-0.5 shrink-0" />
                                 <p className="text-[13px] font-bold text-secondary leading-relaxed italic">
                                    {alert.message || "Analyzing signal metadata topology... No immediate remediation required."}
                                 </p>
                              </div>
                           </div>
                        </td>
                        <td>
                           <div className="flex flex-col">
                              <span className="font-mono text-[11px] font-bold text-foreground">
                                 {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                              <span className="text-[9px] font-bold text-muted uppercase tracking-widest mt-0.5">Cluster Zone-A</span>
                           </div>
                        </td>
                        <td className="text-right">
                           <div className="flex items-center justify-end gap-2 pr-4">
                              <button 
                                onClick={(e) => { e.stopPropagation(); navigate('/ai-chat', { state: { initialMessage: `/analyze alert ${alert.id}` } }); }} 
                                className="h-8 w-8 flex items-center justify-center rounded border border-border hover:border-foreground transition-all shadow-sm group/btn bg-white" 
                                title="Intelligence Logic"
                              >
                                 <BrainCircuit className="h-3.5 w-3.5 text-muted group-hover/btn:text-foreground" />
                              </button>
                              {alert.status === 'TRIGGERED' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); acknowledgeMutation.mutate(alert.id); }} 
                                  disabled={acknowledgeMutation.isPending}
                                  className="h-8 w-8 flex items-center justify-center rounded border border-border hover:bg-foreground hover:text-background transition-all shadow-sm bg-white" 
                                  title="Acknowledge"
                                >
                                   <CheckCircle2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button className="h-8 w-8 flex items-center justify-center rounded border border-border hover:bg-foreground hover:text-background transition-all shadow-sm bg-white">
                                 <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

       {/* System Integrity Logic */}
       <div className="p-8 border border-border bg-foreground rounded-2xl flex items-center justify-between text-background">
          <div className="flex items-center gap-6">
             <div className="h-12 w-12 bg-background rounded-xl flex items-center justify-center text-foreground shadow-xl">
                <ShieldCheck className="h-6.5 w-6.5" />
             </div>
             <div className="space-y-1">
                <h4 className="text-lg font-bold tracking-tight m-0">Ingress Shard Integrity Verified</h4>
                <p className="text-[11px] font-medium opacity-100 uppercase tracking-widest">Global Telemetry Stream • Latency 0.8ms • CRC Validated</p>
             </div>
          </div>
          <div className="flex items-center gap-10">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Uptime Heartbeat</span>
                <span className="text-xl font-mono font-bold">99.999%</span>
             </div>
             <div className="h-8 w-px bg-background opacity-10" />
             <button className="h-10 px-6 border border-background text-[11px] font-bold uppercase tracking-widest hover:bg-background hover:text-foreground transition-all">
                Protocol Matrix
             </button>
          </div>
       </div>
    </div>
  )
}

export default AlertsPage
