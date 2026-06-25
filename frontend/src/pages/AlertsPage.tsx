import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  BellOff, 
  ArrowRight,
  Download,
  Database,
  Search,
  CheckCircle2,
  BrainCircuit,
  Zap,
  MoreVertical,
  Filter
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { exportToCSV } from '@/utils/export'
import { useAlertStream } from '@/hooks/useAlertStream'
import { useOrganization } from '@/hooks'
import { toast } from 'sonner'

const AlertsPage: React.FC = () => {
  const { organizationId } = useOrganization()
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  
  const { data: alerts, refetch } = useQuery({
    queryKey: ['alerts', organizationId],
    queryFn: () => apiClient.getAlerts(organizationId || 'default'),
    refetchInterval: 10000
  })

  useAlertStream((newAlert) => {
    toast(`SIGNAL_INCOMING: ${newAlert.alertName}`, {
      icon: <Zap className="h-4 w-4 text-blue-500" />,
      description: `SEV: ${newAlert.status} | SOURCE: ${newAlert.source}`,
    })
    refetch()
  })

  const filteredAlerts = alerts?.filter((a: any) => 
    (a.alertName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (a.source?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleExport = () => {
    if (filteredAlerts) exportToCSV(filteredAlerts, 'OpsMind_AlertStream')
  }

  const handleAcknowledge = async (id: string) => {
    try {
      await apiClient.acknowledgeAlert(id)
      toast.success('Signal acknowledged.')
      refetch()
    } catch (err) {
      toast.error('Identification failed.')
    }
  }

  return (
    <div className="space-y-4 page-transition pb-20">
      {/* Stream Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
           <h1 className="text-xl font-black text-slate-900 tracking-tight">Global Alert Stream</h1>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 Live Telemetry Active • Processing {alerts?.length || 0} Signals
              </span>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleExport} className="btn-secondary h-8 px-3 text-[10px] font-black uppercase tracking-wider">
              <Download className="h-3.5 w-3.5" /> Export
           </button>
           <button className="btn-primary h-8 px-3 text-[10px] font-black uppercase tracking-wider">
              Acknowledge All
           </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="enterprise-card p-2 flex items-center justify-between">
         <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter signals by source, type, or node ID..." 
              className="input-field pl-9 h-8 text-[11px]" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-1 border-l border-slate-100 ml-4 pl-4">
            <button className="btn-ghost p-1.5"><Filter className="h-4 w-4 text-slate-400" /></button>
            <button className="btn-ghost p-1.5"><MoreVertical className="h-4 w-4 text-slate-400" /></button>
         </div>
      </div>

      {/* Signal Table */}
      <div className="enterprise-card overflow-hidden">
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th className="w-20">Severity</th>
                  <th>Source Context</th>
                  <th>Intelligence Objective</th>
                  <th className="w-40">Occurrence</th>
                  <th className="w-24 text-right">Audit</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="py-4 px-4"><div className="h-8 skeleton" /></td></tr>
                  ))
               ) : !filteredAlerts?.length ? (
                  <tr>
                     <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center opacity-30">
                           <BellOff className="h-10 w-10 mb-2" />
                           <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero active signals</p>
                        </div>
                     </td>
                  </tr>
               ) : filteredAlerts?.map((alert: any) => (
                  <tr key={alert.id} className="group hover:bg-slate-50 transition-colors">
                     <td>
                        <span className={cn(
                          "status-badge",
                          alert.status === 'TRIGGERED' ? "badge-critical" : "badge-success"
                        )}>{alert.status === 'TRIGGERED' ? 'CRIT' : 'WARN'}</span>
                     </td>
                     <td>
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 bg-slate-50 border border-slate-100 rounded flex items-center justify-center text-slate-400 shrink-0">
                              {alert.source?.includes('DB') ? <Database className="h-4 w-4" /> : 
                               alert.source?.includes('K8S') ? <Terminal className="h-4 w-4" /> : 
                               <Activity className="h-4 w-4" />}
                           </div>
                           <div className="truncate">
                              <div className="text-[12px] font-black text-slate-900 truncate uppercase tracking-tight">{alert.alertName}</div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                 {alert.source} • <span className="text-slate-300">#{alert.id.toString().slice(-6)}</span>
                              </div>
                           </div>
                        </div>
                     </td>
                     <td className="max-w-xs">
                        <div className="flex items-start gap-2.5">
                           <BrainCircuit className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                           <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                              {alert.message || "Synthesizing event telemetry for root cause analysis..."}
                           </p>
                        </div>
                     </td>
                     <td>
                        <span className="text-[11px] font-medium text-slate-500 metric-mono">
                           {new Date(alert.timestamp).toLocaleString([], { hour12: false })}
                        </span>
                     </td>
                     <td className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => navigate('/ai-chat')} className="btn-ghost" title="AI RCA">
                              <BrainCircuit className="h-4 w-4 text-blue-600" />
                           </button>
                           {alert.status === 'TRIGGERED' && (
                             <button onClick={() => handleAcknowledge(alert.id)} className="btn-ghost" title="Acknowledge">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                             </button>
                           )}
                           <button className="btn-ghost" title="Trace Node"><ArrowRight className="h-4 w-4" /></button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  )
}

export default AlertsPage
