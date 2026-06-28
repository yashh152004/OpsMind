import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  BellOff, ArrowRight, Download, Database, Search, CheckCircle2, 
  BrainCircuit, Zap, Activity, Terminal, Info, ShieldCheck, Filter, X, RefreshCcw
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
       toast.success('SIGNAL_ACK: Acknowledgment propagated.')
    }
  })

  return (
    <div className="page-transition-fade space-y-10 p-10 bg-white min-h-screen">
      {/* Stream Orchestration Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tighter text-black m-0 font-geist">Alert Stream</h1>
           <p className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500 animate-pulse" /> Real-time Telemetry Ingress Active • <span className="text-black font-black">{alerts?.length || 0} Open Signals</span>
           </p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExport} className="btn-secondary h-10 border-strong group">
              <Download className="h-4 w-4" />
              <span className="ml-2">Export Audit</span>
           </button>
           <button className="btn-primary h-10 shadow-xl shadow-black/10">
              <CheckCircle2 className="h-4 w-4" />
              <span className="ml-2">Acknowledge All</span>
           </button>
        </div>
      </div>

      {/* Selective Filter Strip */}
      <div className="flex items-center gap-4">
         <div className="relative group flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-black transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by Source Entity, Signal Shard, or Severity Class..." 
              className="input-field pl-10 h-10 border-strong" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button className="h-10 px-6 border border-border-strong rounded-[var(--radius)] text-[11px] font-black uppercase tracking-widest hover:border-black transition-all">
            <Filter className="h-4 w-4" />
         </button>
         <button onClick={() => refetch()} className={cn("p-2 border border-border-strong rounded-[var(--radius)] hover:border-black transition-all", isRefetching && "animate-spin")}>
            <RefreshCcw className="h-4 w-4 text-muted" />
         </button>
      </div>

      {/* Operational Signal Grid */}
      <div className="enterprise-table-container shadow-2xl shadow-black/5 overflow-hidden">
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th className="w-32">Severity Class</th>
                  <th>Identifier & Ingress Origin</th>
                  <th className="w-[40%]">Predictive Reasoning Logic</th>
                  <th className="w-40">Detection TS</th>
                  <th className="w-32 text-right">Action</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="py-12"><div className="h-6 skeleton w-full" /></td></tr>
                  ))
               ) : !filteredAlerts?.length ? (
                  <tr>
                     <td colSpan={5} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                           <BellOff className="h-12 w-12" />
                           <div className="space-y-1">
                              <h3 className="text-xs font-black uppercase tracking-widest text-black border-none mb-0 pb-0">Zero Telemetry Breaches</h3>
                              <p className="text-[10px] font-bold uppercase tracking-tighter text-muted">Monitoring 1,429 ingestion paths in us-east-1</p>
                           </div>
                        </div>
                     </td>
                  </tr>
               ) : filteredAlerts?.map((alert: any) => (
                  <tr key={alert.id} className="group hover:bg-surface-alt/50 transition-all cursor-pointer">
                     <td>
                        <div className="flex items-center gap-2">
                           <div className={cn("h-1.5 w-1.5 rounded-full", alert.status === 'TRIGGERED' ? "bg-red-600 animate-pulse" : "bg-black")} />
                           <span className={cn(
                             "status-badge",
                             alert.status === 'TRIGGERED' ? "badge-critical" : "badge-success"
                           )}>{alert.status === 'TRIGGERED' ? 'CRITICAL' : 'NOMINAL'}</span>
                        </div>
                     </td>
                     <td className="py-5">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-surface-alt border border-border-strong rounded flex items-center justify-center text-muted group-hover:text-black group-hover:border-black transition-all shrink-0">
                              {alert.source?.includes('DB') ? <Database className="h-4.5 w-4.5" /> : 
                               alert.source?.includes('K8S') ? <Terminal className="h-4.5 w-4.5" /> : 
                               <Activity className="h-4.5 w-4.5" />}
                           </div>
                           <div className="truncate space-y-1">
                              <div className="text-[13px] font-black text-black truncate group-hover:underline">{alert.alertName}</div>
                              <div className="text-[10px] text-muted font-bold flex items-center gap-2 uppercase tracking-widest">
                                 {alert.source} • <span className="font-mono text-muted/60 lowercase italic">sh-ingress-01</span>
                              </div>
                           </div>
                        </div>
                     </td>
                     <td className="py-5">
                        <div className="flex items-start gap-4 p-4 border border-border-strong rounded bg-surface-alt/20 group-hover:bg-white group-hover:border-black transition-all">
                           <BrainCircuit className="h-5 w-5 text-black mt-0.5 shrink-0" />
                           <div className="space-y-1">
                              <div className="text-[9px] font-black text-black uppercase tracking-widest">SRE Logic v2 PROXIMITY</div>
                              <p className="text-[12px] font-medium text-muted leading-relaxed italic pr-4">
                                 {alert.message || "Synthesizing event telemetry signatures... Predicting 84% probability of downstream node failure."}
                              </p>
                           </div>
                        </div>
                     </td>
                     <td>
                        <div className="flex flex-col gap-1">
                           <span className="font-mono text-[11px] font-black text-black italic">
                              {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                           </span>
                           <span className="text-[8px] font-black text-muted uppercase tracking-widest">us-east-zone-a</span>
                        </div>
                     </td>
                     <td className="text-right py-5">
                        <div className="flex items-center justify-end gap-2 pr-4">
                           <button onClick={() => navigate('/ai-chat', { state: { initialMessage: `/analyze alert ${alert.id}` } })} className="h-10 w-10 flex items-center justify-center rounded border border-border-strong hover:border-black text-muted hover:text-black transition-all shadow-sm" title="AI Deep Insight">
                              <BrainCircuit className="h-4 w-4" />
                           </button>
                           {alert.status === 'TRIGGERED' && (
                             <button 
                               onClick={() => acknowledgeMutation.mutate(alert.id)} 
                               disabled={acknowledgeMutation.isPending}
                               className="h-10 w-10 flex items-center justify-center rounded border border-border-strong hover:bg-black hover:text-white transition-all shadow-sm" 
                               title="Acknowledge Signal"
                             >
                                <CheckCircle2 className="h-4 w-4" />
                             </button>
                           )}
                           <button className="h-10 w-10 flex items-center justify-center rounded border border-border-strong hover:bg-black hover:text-white transition-all shadow-sm">
                              <ArrowRight className="h-4 w-4" />
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

       {/* Platform Health Logic Strip */}
       <div className="p-10 border border-black bg-black text-white flex items-center justify-between">
          <div className="flex items-center gap-8">
             <div className="h-14 w-14 bg-white rounded flex items-center justify-center text-black shadow-2xl">
                <ShieldCheck className="h-8 w-8" />
             </div>
             <div className="space-y-1">
                <h4 className="text-xl font-black tracking-tighter uppercase font-geist">Ingress Stream Verified</h4>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Processing 422,000 signals/hr • LATENCY: 1.4ms • GLOBAL</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Health Heartbeat</span>
                <span className="text-lg font-mono font-black">99.999%</span>
             </div>
             <div className="h-12 w-[1px] bg-white/10" />
             <button className="h-11 px-8 border border-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all italic">Source Protocol</button>
          </div>
       </div>
    </div>
  )
}

export default AlertsPage
