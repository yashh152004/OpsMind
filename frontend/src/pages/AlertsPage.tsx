import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  BellOff, 
  ShieldAlert, 
  Terminal,
  Activity,
  ArrowRight,
  Download,
  Database,
  Search,
  CheckCircle2,
  BrainCircuit,
  Zap
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
  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiClient.getAlerts(organizationId || 'default'),
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


  const handleExport = () => {
    if (filteredAlerts) exportToCSV(filteredAlerts, 'OpsMind_AlertStream')
  }

  return (
    <div className="space-y-8 page-transition pb-20">
      {/* Search & Control Strip with Header Integration */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between border-b border-slate-200 pb-8">
        <div>
           <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Telemetry Alerts</h1>
           <p className="text-slate-500 text-sm font-medium mt-1">Real-time signal stream from global edge monitors.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
             <input 
               type="text" 
               placeholder="Search signal stream..."
               className="w-full bg-white border border-slate-200 rounded-xl px-12 py-2.5 text-sm font-medium text-[#0F172A] outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button className="px-4 py-2.5 bg-white border border-slate-200 text-[#0F172A] font-bold text-xs rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2" onClick={handleExport}>
             <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
          </button>
          <button className="px-4 py-2.5 bg-red-50 border border-red-100 text-red-600 font-black text-xs rounded-xl hover:bg-red-100 transition-all flex items-center gap-2 uppercase tracking-tighter shadow-sm">
             <BellOff className="h-4 w-4" /> <span className="hidden sm:inline">Silence</span>
          </button>
        </div>
      </div>

      {/* Alert Metadata Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
         {[
           { label: 'Signals Triggered', value: alerts?.filter((a:any) => a.status === 'TRIGGERED').length || 0, color: 'text-red-600', icon: ShieldAlert },
           { label: 'Active Sinks', value: '14/14', color: 'text-blue-600', icon: Database },
           { label: 'Signal Entropy', value: '0.04σ', color: 'text-slate-400', icon: Activity },
           { label: 'Engine Health', value: 'NOMINAL', color: 'text-emerald-600', icon: CheckCircle2 },
           { label: 'Stream State', value: isConnected ? 'STABLE' : 'RECONNECT', color: isConnected ? 'text-emerald-600' : 'text-orange-500', icon: Zap }
         ].map(stat => (
           <div key={stat.label} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</span>
                <div className={cn("text-sm font-black mt-1", stat.color)}>{stat.value}</div>
              </div>
              <stat.icon className="h-4 w-4 text-slate-200 group-hover:text-blue-200 transition-colors" />
           </div>
         ))}
      </div>

      {/* Main Stream surface */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Origin</th>
                <th className="px-8 py-5">Signal Payload</th>
                <th className="px-8 py-5 hidden xl:table-cell">Observer ID</th>
                <th className="px-8 py-5 hidden sm:table-cell">Current State</th>
                <th className="px-8 py-5 hidden lg:table-cell">Trigger Node</th>
                <th className="px-8 py-5 text-right">Autonomous Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-8 py-6"><div className="h-10 bg-slate-100 animate-pulse rounded-lg" /></td></tr>
                ))
              ) : !filteredAlerts?.length ? (
                <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-400 font-bold text-sm">No active alerts detected in current window.</td></tr>
              ) : filteredAlerts?.map((alert: any) => (
                <tr key={alert.id} className="group hover:bg-slate-50/80 transition-colors border-l-2 border-transparent hover:border-blue-600">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                         alert.status === 'TRIGGERED' ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                       )}>
                         {alert.status === 'TRIGGERED' ? <ShieldAlert className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                       </div>
                       <span className="text-xs font-black text-[#0F172A] uppercase tracking-widest">{alert.source}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-extrabold text-[#0F172A] leading-tight">{alert.alertName}</div>
                    <div className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight line-clamp-1">{alert.message}</div>
                  </td>
                  <td className="px-8 py-6 hidden xl:table-cell">
                    <code className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 border border-slate-200">OBS-SEC-{alert.id.toString().slice(-4)}</code>
                  </td>
                  <td className="px-8 py-6 hidden sm:table-cell">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      alert.status === 'TRIGGERED' ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>{alert.status}</span>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                       <Terminal className="h-3.5 w-3.5 text-slate-300" />
                       {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button 
                         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                         title="AI SRE Reasoning"
                         onClick={(e) => {
                           e.stopPropagation();
                           navigate('/ai-chat', { state: { initialMessage: `/rca alert ${alert.id} from ${alert.source}` } });
                         }}
                       >
                         <BrainCircuit className="h-4 w-4" />
                       </button>
                       {alert.status === 'TRIGGERED' && (
                         <button 
                          title="Acknowledge Signal" 
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(alert.id);
                          }}
                         >
                           <CheckCircle2 className="h-4 w-4" />
                         </button>
                       )}
                       <button title="View Full Trace" className="p-2 text-slate-300 hover:text-[#0F172A] rounded-lg border border-transparent hover:border-slate-100 transition-all"><ArrowRight className="h-4 w-4" /></button>
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
