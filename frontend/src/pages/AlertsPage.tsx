import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Bell, 
  BellOff, 
  ShieldAlert, 
  Terminal,
  Activity,
  ArrowRight,
  Filter,
  Download,
  AlertTriangle,
  Database,
  Search,
  CheckCircle2,
  Trash2
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { exportToCSV } from '@/utils/export'
import { useAlertStream } from '@/hooks/useAlertStream'
import { toast } from 'sonner'

const AlertsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiClient.getAlerts('default'),
  })

  const { isConnected } = useAlertStream((newAlert) => {
    toast.error(`New Alert: ${newAlert.alertName}`, {
      description: newAlert.message,
    })
    refetch()
  })

  const filteredAlerts = alerts?.filter((a: any) => 
    (a.alertName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (a.message?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleAcknowledge = async (id: string) => {
    try {
      await apiClient.acknowledgeAlert(id)
      refetch()
    } catch (err) {
      console.error('Failed to acknowledge', err)
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await apiClient.resolveAlert(id)
      refetch()
    } catch (err) {
      console.error('Failed to resolve', err)
    }
  }

  const handleExport = () => {
    if (filteredAlerts) exportToCSV(filteredAlerts, 'OpsMind_AlertStream')
  }

  return (
    <div className="space-y-4 page-transition pb-20">
      {/* Search & Control Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 w-full relative group">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
           <input 
             type="text" 
             placeholder="Search alert stream..."
             className="input-field pl-10 h-10 w-full"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="btn-secondary h-10 text-xs gap-2 flex-1 md:flex-none justify-center" onClick={handleExport}>
             <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
          </button>
          <button className="btn-secondary h-10 text-xs gap-2 text-destructive hover:bg-destructive/10 flex-1 md:flex-none justify-center border-destructive/20 bg-destructive/5 font-bold">
             <BellOff className="h-4 w-4" /> <span className="hidden sm:inline">Silence Stream</span>
          </button>
        </div>
      </div>

      {/* Alert Metadata Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
         {[
           { label: 'Triggered', value: alerts?.filter((a:any) => a.status === 'TRIGGERED').length || 0, color: 'text-red-500' },
           { label: 'Active Sinks', value: '14', color: 'text-blue-500' },
           { label: 'Signal Noise', value: '4%', color: 'text-muted-foreground' },
           { label: 'Engine Health', value: '100%', color: 'text-emerald-500' },
           { label: 'Live Connection', value: isConnected ? 'CONNECTED' : 'RECONNECTING', color: isConnected ? 'text-emerald-500' : 'text-orange-500' }
         ].map(stat => (
           <div key={stat.label} className="enterprise-card p-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">{stat.label}</span>
              <span className={cn("text-sm font-bold font-mono", stat.color)}>{stat.value}</span>
           </div>
         ))}
      </div>

      {/* Main Stream surface */}
      <div className="enterprise-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-accent/40 border-b border-border">
              <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Alert Payload</th>
                <th className="px-5 py-3 hidden xl:table-cell">Monitor ID</th>
                <th className="px-5 py-3 hidden sm:table-cell">Status</th>
                <th className="px-5 py-3 hidden lg:table-cell">Timestamp</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-10 skeleton" /></td></tr>
                ))
              ) : filteredAlerts?.map((alert: any) => (
                <tr key={alert.id} className="group hover:bg-accent/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                       <div className={cn(
                         "h-8 w-8 rounded flex items-center justify-center shrink-0 border",
                         alert.status === 'TRIGGERED' ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.1)]" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                       )}>
                         {alert.status === 'TRIGGERED' ? <ShieldAlert className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                       </div>
                       <span className="text-xs font-bold">{alert.source}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-bold leading-none">{alert.alertName}</div>
                    <div className="text-[10px] text-muted-foreground mt-1.5 font-mono line-clamp-1">{alert.message}</div>
                  </td>
                  <td className="px-5 py-4 hidden xl:table-cell">
                    <code className="text-[10px] bg-accent/40 px-1.5 py-0.5 rounded text-primary border border-primary/20">MON-8B2-X</code>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className={cn(
                      "status-badge",
                      alert.status === 'TRIGGERED' ? "badge-critical" : "badge-success"
                    )}>{alert.status}</span>
                  </td>
                  <td className="px-5 py-4 text-[10px] font-mono text-muted-foreground hidden lg:table-cell">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                       {alert.status === 'TRIGGERED' && (
                         <button 
                          title="Acknowledge" 
                          className="btn-ghost p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full"
                          onClick={() => handleAcknowledge(alert.id)}
                         >
                           <CheckCircle2 className="h-4 w-4" />
                         </button>
                       )}
                       {alert.status !== 'RESOLVED' && (
                        <button 
                          title="Resolve Signal" 
                          className="btn-ghost p-2 text-blue-500 hover:bg-blue-500/10 rounded-full"
                          onClick={() => handleResolve(alert.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                       )}
                       <button title="View Detail" className="btn-ghost p-2 rounded-full border border-transparent hover:border-border"><ArrowRight className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AlertsPage
