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
  Activity, 
  Terminal,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAlertStream } from '@/hooks/useAlertStream'
import { useOrganization } from '@/hooks'
import { toast } from 'sonner'

const AlertsPage: React.FC = () => {
  const { organizationId } = useOrganization()
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  
  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['alerts', organizationId],
    queryFn: () => apiClient.getAlerts(organizationId || 'default'),
    refetchInterval: 10000
  })

  useAlertStream((newAlert) => {
    toast(`Alert Detected: ${newAlert.alertName}`, {
      icon: <Zap className="h-4 w-4 text-accent" />,
      description: `Source: ${newAlert.source}`,
    })
    refetch()
  })

  const filteredAlerts = alerts?.filter((a: any) => 
    (a.alertName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (a.source?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleExport = async () => {
    try {
      const blob = await apiClient.exportModule('alerts');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OpsMind_Alerts_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Alerts exported successfully.');
    } catch (err) {
      toast.error('Failed to generate export file.');
    }
  }

  const handleAcknowledge = async (id: string) => {
    try {
      await apiClient.acknowledgeAlert(id)
      toast.success('Alert acknowledged.')
      refetch()
    } catch (err) {
      toast.error('Failed to acknowledge alert.')
    }
  }

  return (
    <div className="main-content-grid page-transition-fade">
      {/* Stream Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
           <h1 className="text-page-title">Alert Stream</h1>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-helper font-medium">
                 Live telemetry active • {alerts?.length || 0} active signals
              </span>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleExport} className="btn-secondary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
           </button>
           <button className="btn-primary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">
              Acknowledge All
           </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="enterprise-card p-2 bg-slate-50/50 flex items-center justify-between">
         <div className="relative flex-1 max-w-lg group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Filter alerts by source, type, or service..." 
              className="input-field pl-9 h-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Signal Table */}
      <div className="enterprise-table-container">
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th className="w-24">Severity</th>
                  <th>Alert Summary & Source</th>
                  <th>Condition & Insights</th>
                  <th className="w-40">Timestamp</th>
                  <th className="w-24 text-right">Actions</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="py-8"><div className="h-4 bg-slate-100 animate-pulse rounded w-full" /></td></tr>
                  ))
               ) : !filteredAlerts?.length ? (
                  <tr>
                     <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center opacity-30 text-muted">
                           <BellOff className="h-10 w-10 mb-2" />
                           <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Zero active alerts</p>
                        </div>
                     </td>
                  </tr>
               ) : filteredAlerts?.map((alert: any) => (
                  <tr key={alert.id} className="group">
                     <td>
                        <span className={cn(
                          "status-badge",
                          alert.status === 'TRIGGERED' ? "badge-critical" : "badge-success"
                        )}>{alert.status === 'TRIGGERED' ? 'Critical' : 'Warning'}</span>
                     </td>
                     <td>
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 bg-slate-100 border border-border rounded flex items-center justify-center text-muted shrink-0">
                              {alert.source?.includes('DB') ? <Database className="h-4 w-4" /> : 
                               alert.source?.includes('K8S') ? <Terminal className="h-4 w-4" /> : 
                               <Activity className="h-4 w-4" />}
                           </div>
                           <div className="truncate">
                              <div className="text-[13px] font-bold text-primary truncate max-w-[250px]">{alert.alertName}</div>
                              <div className="text-[10px] text-muted font-bold flex items-center gap-1.5 mt-0.5 uppercase tracking-wider">
                                 {alert.source} • <span className="font-mono opacity-60">ID-{alert.id.toString().slice(-6)}</span>
                              </div>
                           </div>
                        </div>
                     </td>
                     <td className="max-w-xs">
                        <div className="flex items-start gap-2">
                           <BrainCircuit className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                           <p className="text-[11px] text-secondary leading-normal line-clamp-2 font-medium">
                              {alert.message || "Synthesizing event telemetry for impact analysis..."}
                           </p>
                        </div>
                     </td>
                     <td>
                        <span className="text-[11px] font-medium text-muted metric-value">
                           {new Date(alert.timestamp).toLocaleString([], { hour12: false })}
                        </span>
                     </td>
                     <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                           <button onClick={() => navigate('/ai-chat', { state: { initialMessage: `/analyze alert ${alert.id}` } })} className="btn-ghost" title="AI Analysis">
                              <BrainCircuit className="h-3.5 w-3.5 text-accent" />
                           </button>
                           {alert.status === 'TRIGGERED' && (
                             <button onClick={() => handleAcknowledge(alert.id)} className="btn-ghost" title="Acknowledge">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                             </button>
                           )}
                           <button className="btn-ghost" title="View Source"><ArrowRight className="h-3.5 w-3.5" /></button>
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
