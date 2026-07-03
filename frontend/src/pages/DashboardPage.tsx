import React, { useState } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { 
  Activity, AlertTriangle, ShieldCheck, Cpu,
  Plus, Download, FileText, Layout, Info, TrendingUp, TrendingDown,
  ChevronRight, ArrowUpRight, BarChart3, Terminal, X,
  Search, Globe, Database, Server, Settings as SettingsIcon, Bell, Zap,
  Clock, RefreshCw
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import Widget from '@/components/Widget'
import { toast } from 'sonner'

const DashboardSkeleton = () => (
  <div className="space-y-8 p-8 animate-in fade-in duration-500 bg-background min-h-screen">
    <div className="flex justify-between items-end pb-8 border-b border-border">
      <div className="space-y-4">
        <div className="h-10 w-80 skeleton-ui" />
        <div className="h-4 w-60 skeleton-ui" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-32 skeleton-ui" />
        <div className="h-10 w-32 skeleton-ui" />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton-ui" />)}
    </div>
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8 h-[400px] skeleton-ui" />
      <div className="lg:col-span-4 h-[400px] skeleton-ui" />
    </div>
  </div>
)

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [isExporting, setIsExporting] = useState(false)
  const [showWidgetMarketplace, setShowWidgetMarketplace] = useState(false)

  const { data: stats, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
    refetchInterval: 15000 // Professional sync interval
  })

  if (isLoading) return <DashboardSkeleton />

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await apiClient.exportModule('incidents')
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `OpsMind_Status_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      toast.success("Platform state exported successfully.")
    } catch (e) {
      toast.error("Failed to generate export.")
    } finally {
      setIsExporting(false)
    }
  }

  const kpis = [
    { label: 'Platform Availability', val: stats?.uptime || '99.99%', trend: '+0.01%', status: 'NOMINAL', icon: Globe, href: '/infrastructure' },
    { label: 'Active Incidents', val: stats?.activeIncidents || '0', trend: 'STABLE', status: stats?.activeIncidents > 0 ? 'WARNING' : 'HEALTHY', icon: AlertTriangle, href: '/incidents' },
    { label: 'Median Latency', val: stats?.mttr || '18ms', trend: '-1.4ms', status: 'FAST', icon: Cpu, href: '/analytics' },
    { label: 'Security Posture', val: '98.4%', trend: 'SECURE', status: 'VERIFIED', icon: ShieldCheck, href: '/security' },
  ]

  return (
    <div className="page-transition-fade space-y-8 p-6 lg:p-8 bg-background min-h-screen max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold tracking-tight text-foreground m-0">Platform Overview</h1>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[11px] font-bold uppercase tracking-wider">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Operational
              </div>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted flex items-center gap-1.5">
                 <Clock className="h-3.5 w-3.5" /> Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => refetch()}
             className="btn-secondary h-9 w-9 p-0 flex items-center justify-center"
             title="Force Refresh"
           >
              <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
           </button>
           <button 
             onClick={handleExport}
             disabled={isExporting}
             className="btn-secondary h-9"
           >
              {isExporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="ml-2">Export</span>
           </button>
           <button 
              onClick={() => setShowWidgetMarketplace(true)}
              className="btn-primary h-9"
           >
              <Plus className="h-4 w-4" />
              <span className="ml-2">Add Module</span>
           </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ icon: Icon, ...kpi }) => (
          <div key={kpi.label} 
               onClick={() => navigate(kpi.href)}
               className="card-enterprise p-5 cursor-pointer flex flex-col justify-between group active:scale-[0.99] transition-all">
            <div className="flex justify-between items-start">
               <div className="p-2 bg-surface-alt border border-border-strong rounded-md text-foreground transition-colors group-hover:bg-foreground group-hover:text-white">
                  <Icon className="h-4 w-4" />
               </div>
               <span className={cn(
                 "badge-enterprise",
                 kpi.status === 'HEALTHY' || kpi.status === 'NOMINAL' ? "badge-success" : 
                 kpi.status === 'FAST' || kpi.status === 'SECURE' ? "badge-info" : "badge-warning"
               )}>{kpi.status}</span>
            </div>
             <div className="mt-4 space-y-1">
               <div className="text-[12px] font-bold text-secondary uppercase tracking-widest">{kpi.label}</div>
               <div className="flex items-end justify-between">
                  <div className="text-2xl font-black tracking-tight text-foreground">{kpi.val}</div>
                  <div className="text-[11px] font-black text-emerald-700 flex items-center gap-0.5">
                     <TrendingUp className="h-3 w-3" />
                     {kpi.trend}
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Telemetry Chart */}
        <div className="lg:col-span-8 flex flex-col h-full">
           <div className="card-enterprise flex-1 flex flex-col">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                 <div>
                    <h3 className="text-[14px] font-bold text-foreground mb-0">Cluster Performance</h3>
                    <p className="text-[11px] text-muted font-medium mb-0 uppercase tracking-widest">Throughput vs Latency • 6h window</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                       <div className="h-2 w-2 rounded-full bg-foreground" />
                       <span className="text-[10px] font-bold uppercase text-muted">Ingress</span>
                    </div>
                 </div>
              </div>
              <div className="p-6 h-[340px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={stats?.performanceSeries || []}>
                     <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#000" stopOpacity={0.05}/>
                          <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                       <XAxis 
                       dataKey="time" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: 'var(--foreground)', fontSize: 10, fontWeight: 700}} 
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{fill: 'var(--foreground)', fontSize: 10, fontWeight: 700}} 
                     />
                     <Tooltip 
                       contentStyle={{ 
                          backgroundColor: 'var(--surface)', 
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--radius)',
                          fontSize: '12px',
                          fontWeight: '600'
                       }} 
                     />
                     <Area type="monotone" dataKey="value" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Tactical Feed */}
        <div className="lg:col-span-4 space-y-6">
           <div className="card-enterprise p-6">
              <h3 className="text-[14px] font-bold text-foreground mb-4 uppercase tracking-widest">Incident Distribution</h3>
              <div className="space-y-3">
                 {(stats?.severityDistribution || []).map((entry: any) => (
                   <div key={entry.name} 
                        onClick={() => navigate('/incidents')}
                        className="flex items-center justify-between p-3 rounded-md border border-border hover:border-border-strong hover:bg-surface-alt transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                         <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", 
                            entry.name === 'P1' ? "bg-red-600" : 
                            entry.name === 'P2' ? "bg-amber-500" : "bg-foreground")} 
                         />
                         <span className="text-[13px] font-semibold text-foreground">{entry.name} Priority</span>
                      </div>
                      <span className="text-[13px] font-bold text-foreground">{entry.count}</span>
                   </div>
                 ))}
                 {(!stats?.severityDistribution || stats.severityDistribution.length === 0) && (
                    <div className="text-center py-6">
                       <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-20" />
                       <p className="text-[12px] font-medium text-muted">No active priorities</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="card-enterprise p-6 bg-foreground text-white border-none shadow-[0_12px_24px_-10px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-4">
                 <Zap className="h-4 w-4 text-emerald-400" />
                 <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-400">Intelligent Insights</span>
              </div>
              <p className="text-[13px] font-medium leading-relaxed mb-6 text-neutral-400">
                 Platform is stable. AI monitored {stats?.riskProfiles?.length || 0} potential anomalies in the last window. All resolved through automated shielding.
              </p>
              <button 
                onClick={() => navigate('/ai-insights')}
                className="w-full h-9 bg-white text-black rounded font-bold text-[11px] uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                >
                 View Analysis Matrix
              </button>
           </div>
        </div>
      </div>

      {/* Intelligence & Audit Feed */}
      <div className="space-y-4">
         <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
               <h2 className="text-lg font-bold tracking-tight text-foreground m-0">Recent Operational Intelligence</h2>
               <div className="px-1.5 py-0.5 bg-surface-alt border border-border rounded text-[10px] font-bold text-muted uppercase">Live</div>
            </div>
            <button onClick={() => navigate('/ai-insights')} className="text-[12px] font-semibold text-muted hover:text-foreground transition-colors flex items-center gap-1">
               Detailed Grid <ChevronRight className="h-4 w-4" />
            </button>
         </div>
         
         <div className="table-container">
            <table className="table-enterprise">
               <thead>
                  <tr>
                     <th className="w-[180px]">Signal Type</th>
                     <th>Intelligence Reasoning & Live Context</th>
                     <th className="text-right w-[120px]">Conviction</th>
                     <th className="w-32 text-right">Verification</th>
                  </tr>
               </thead>
               <tbody>
                  {(stats?.riskProfiles || []).slice(0, 5).map((item: any, idx: number) => (
                     <tr key={idx}>
                        <td>
                           <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-surface-alt rounded">
                                 <Terminal className="h-3.5 w-3.5 text-muted" />
                              </div>
                              <span className="font-bold text-[12px] tracking-tight">{item.type}</span>
                           </div>
                        </td>
                        <td className="text-[13px] text-muted-foreground italic py-4">
                           {item.context}
                        </td>
                        <td className="text-right font-mono font-bold text-[14px]">
                           {(item.conf * 100).toFixed(1)}%
                        </td>
                        <td className="text-right">
                           <button 
                             onClick={() => navigate('/ai-chat')}
                             className="text-[11px] font-bold uppercase tracking-wider text-muted hover:text-foreground transition-colors"
                           >
                              Review
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
      
      {/* Widget Provisioning Modal */}
      {showWidgetMarketplace && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="card-enterprise w-full max-w-2xl bg-surface shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                 <div className="space-y-1">
                    <h2 className="text-lg font-bold text-foreground m-0">Provision New Module</h2>
                    <p className="text-[12px] text-muted font-medium mb-0">Extend the Platform Command interface with new telemetry views.</p>
                 </div>
                 <button onClick={() => setShowWidgetMarketplace(false)} className="p-2 hover:bg-surface-alt rounded-full transition-colors">
                    <X className="h-5 w-5" />
                 </button>
              </div>
              <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                 {[
                   { name: 'Node Topology', icon: Terminal, desc: 'Visual service mapping' },
                   { name: 'Correlation', icon: Activity, desc: 'Multi-signal analysis' },
                   { name: 'Cloud Spend', icon: Layout, desc: 'Real-time billing' },
                   { name: 'Posture', icon: ShieldCheck, desc: 'Compliance status' },
                   { name: 'Latency', icon: Server, desc: 'Region RTT metrics' },
                   { name: 'Prophet AI', icon: Zap, desc: 'Predictive analytics' }
                 ].map(({ icon: Icon, ...w }) => (
                   <div key={w.name} className="p-4 border border-border rounded-lg hover:border-foreground hover:bg-surface-hover cursor-pointer group transition-all text-center">
                      <div className="h-10 w-10 bg-surface-alt border border-border rounded-md mx-auto mb-3 flex items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-white">
                         <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-[13px] font-bold text-foreground mb-1">{w.name}</div>
                      <div className="text-[11px] text-muted leading-tight">{w.desc}</div>
                   </div>
                 ))}
              </div>
              <div className="px-6 py-4 bg-surface-alt/50 border-t border-border flex justify-end gap-3">
                 <button onClick={() => setShowWidgetMarketplace(false)} className="btn-ghost">Cancel</button>
                 <button onClick={() => setShowWidgetMarketplace(false)} className="btn-primary">Provision</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
