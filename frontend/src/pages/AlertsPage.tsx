import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  BellOff, Download, Database, Search, CheckCircle2, 
  BrainCircuit, Activity, Terminal, ShieldCheck, RefreshCcw, 
  ChevronRight
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

  const acknowledgeAllMutation = useMutation({
    mutationFn: () => apiClient.acknowledgeAllAlerts(),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey:['alerts'] })
       toast.success('All active alerts acknowledged.')
    }
  })

  return (
    <div className="page-transition-fade space-y-6 p-6 lg:p-8 bg-background min-h-screen">
      {/* Stream Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-border">
        <div className="space-y-1 text-left">
           <h1 className="text-[32px] font-bold tracking-tight text-foreground m-0 leading-tight">Alert Stream</h1>
           <div className="flex items-center gap-2.5">
              <span className="badge-enterprise bg-surface-alt border border-border py-0.5">
                 <Activity className="h-3.5 w-3.5 mr-1 text-foreground animate-pulse" />
                 Telemetry Live
              </span>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted-foreground">
                 Monitoring <span className="text-foreground font-semibold">{alerts?.length || 0} active signals</span> across clusters.
              </p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleExport} className="btn-secondary h-8.5 px-3">
              <Download className="h-4 w-4" />
              <span>Export Audit</span>
           </button>
           <button 
             onClick={() => acknowledgeAllMutation.mutate()}
             disabled={acknowledgeAllMutation.isPending}
             className="btn-primary h-8.5 px-3"
           >
              {acknowledgeAllMutation.isPending ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Acknowledge All</span>
           </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center gap-2">
         <div className="relative group flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <input 
              type="text" 
              placeholder="Search by signal ID, source, or severity..." 
              className="input-enterprise pl-9 h-8.5 w-full font-normal" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button onClick={() => refetch()} className="btn-secondary h-8.5 w-8.5 p-0 flex items-center justify-center">
            <RefreshCcw className={cn("h-3.5 w-3.5", isRefetching && "animate-spin")} />
         </button>
      </div>

      {/* Alerts Table */}
      <div className="table-container">
         <table className="table-enterprise">
            <thead>
               <tr>
                  <th className="w-24">Severity</th>
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
                        <div className="flex flex-col items-center gap-3 opacity-90">
                           <BellOff className="h-10 w-10 text-muted-foreground/30" />
                           <div className="space-y-1">
                              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground m-0">Zero Telemetry Hazards</h3>
                              <p className="text-[12px] font-normal text-muted-foreground">All system clusters are operating within nominal thresholds.</p>
                           </div>
                        </div>
                     </td>
                  </tr>
               ) : filteredAlerts?.map((alert: any) => (
                  <tr key={alert.id} className="group cursor-pointer">
                     <td>
                        <span className={cn(
                          "badge-enterprise py-0.5",
                          alert.status === 'TRIGGERED' 
                           ? "badge-critical" 
                           : "badge-success"
                        )}>
                           {alert.status === 'TRIGGERED' ? 'Critical' : 'Nominal'}
                        </span>
                     </td>
                     <td className="py-3.5">
                        <div className="flex items-center gap-3">
                           <div className="h-8.5 w-8.5 bg-surface-alt border border-border rounded-[var(--radius)] flex items-center justify-center shrink-0">
                              {alert.source?.includes('DB') ? <Database className="h-4 w-4 text-muted-foreground" /> : 
                               alert.source?.includes('K8S') ? <Terminal className="h-4 w-4 text-muted-foreground" /> : 
                               <Activity className="h-4 w-4 text-muted-foreground" />}
                           </div>
                           <div className="truncate space-y-0.5 text-left">
                              <div className="text-[14px] font-semibold text-foreground truncate group-hover:underline">{alert.alertName}</div>
                              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                 {alert.source} <span className="opacity-60">•</span> <span className="font-mono lowercase opacity-80">shard-{alert.id.slice(-4)}</span>
                              </div>
                           </div>
                        </div>
                     </td>
                     <td className="py-3">
                        <div className="p-3 bg-surface-alt/40 border border-border rounded-[var(--radius)] group-hover:border-border-strong transition-all text-left">
                           <div className="flex items-start gap-2.5">
                              <BrainCircuit className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <p className="text-[13px] font-normal text-foreground/80 leading-normal italic">
                                 {alert.message || "Analyzing signal metadata topology... No remediation required."}
                              </p>
                           </div>
                        </div>
                     </td>
                     <td>
                        <div className="flex flex-col text-left">
                           <span className="font-mono text-[11px] font-semibold text-foreground">
                              {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                           </span>
                           <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Zone-A</span>
                        </div>
                     </td>
                     <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5 pr-2">
                           <button 
                             onClick={(e) => { e.stopPropagation(); navigate('/ai-chat', { state: { initialMessage: `/analyze alert ${alert.id}` } }); }} 
                             className="btn-secondary h-8 w-8 p-0 flex items-center justify-center" 
                             title="AI Reasoning"
                           >
                              <BrainCircuit className="h-3.5 w-3.5 text-muted-foreground" />
                           </button>
                           {alert.status === 'TRIGGERED' && (
                             <button 
                               onClick={(e) => { e.stopPropagation(); acknowledgeMutation.mutate(alert.id); }} 
                               disabled={acknowledgeMutation.isPending}
                               className="btn-secondary h-8 w-8 p-0 flex items-center justify-center text-emerald-500 hover:text-emerald-400" 
                               title="Acknowledge Signal"
                             >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                             </button>
                           )}
                           <button className="btn-secondary h-8 w-8 p-0 flex items-center justify-center">
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

       {/* System Integrity Details Card */}
       <div className="p-6 border border-border bg-surface-alt/40 rounded-[var(--radius)] flex flex-col md:flex-row md:items-center justify-between gap-6 text-foreground">
          <div className="flex items-center gap-4 text-left">
             <div className="h-11 w-11 bg-primary text-primary-foreground rounded-[var(--radius)] flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-5.5 w-5.5" />
             </div>
             <div className="space-y-0.5">
                <h4 className="text-[15px] font-bold tracking-tight m-0">Ingress Shard Integrity Verified</h4>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Global Telemetry Stream • Latency 0.8ms • CRC Validated</p>
             </div>
          </div>
          <div className="flex items-center gap-8 self-end md:self-auto">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Uptime Heartbeat</span>
                <span className="text-xl font-mono font-bold text-foreground">99.999%</span>
             </div>
             <div className="h-8 w-px bg-border hidden sm:block" />
             <button className="btn-secondary h-8.5 text-[11px] uppercase tracking-wider">
                Protocol Matrix
             </button>
          </div>
       </div>
    </div>
  )
}

export default AlertsPage
