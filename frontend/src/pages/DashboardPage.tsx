import React, { useState } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { 
  Activity, AlertTriangle, ShieldCheck, Cpu,
  Plus, Download, FileText, Layout, Info, TrendingUp, TrendingDown,
  ChevronRight, ArrowUpRight, BarChart3, Terminal, X,
  Search, Globe, Database, Server, Settings as SettingsIcon, Bell, Zap
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import Widget from '@/components/Widget'
import { toast } from 'sonner'

const DashboardSkeleton = () => (
  <div className="space-y-10 p-8 animate-in fade-in duration-500 bg-white min-h-screen">
    <div className="flex justify-between items-end pb-8 border-b border-border">
      <div className="space-y-3">
        <div className="h-10 w-72 skeleton" />
        <div className="h-4 w-48 skeleton" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-28 skeleton" />
        <div className="h-10 w-32 skeleton" />
      </div>
    </div>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-36 skeleton" />)}
    </div>
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8 h-[450px] skeleton" />
      <div className="lg:col-span-4 h-[450px] skeleton" />
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
    refetchInterval: 10000 // Real-time pulse
  })

  if (isLoading) return <DashboardSkeleton />

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await apiClient.exportModule('incidents')
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `OpsMind_Audit_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      toast.success("Operational audit exported.")
    } catch (e) {
      toast.error("Export failure.")
    } finally {
      setIsExporting(false)
    }
  }

  const kpis = [
    { label: 'Uptime Integrity', val: stats?.uptime || '99.98%', color: 'text-primary', trend: '+0.01%', status: 'OPTIMIZED', icon: Globe, href: '/infrastructure' },
    { label: 'Signal Disruptions', val: stats?.activeIncidents || '0', color: 'text-black', trend: 'NOMINAL', status: 'STABLE', icon: AlertTriangle, href: '/incidents' },
    { label: 'Cluster Latency', val: stats?.mttr || '12ms', color: 'text-primary', trend: '-2.1ms', status: 'FAST', icon: Server, href: '/analytics' },
    { label: 'Compliance Score', val: '100.0%', color: 'text-primary', trend: 'SECURE', status: 'VERIFIED', icon: ShieldCheck, href: '/security' },
  ]

  return (
    <div className="page-transition-fade space-y-10 p-10 bg-white min-h-screen">
      {/* Enterprise Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tighter text-black m-0 font-geist">Platform Command</h1>
           <div className="flex items-center gap-4">
              <p className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                 <Activity className="h-4 w-4 text-emerald-500" /> System Integrity Certified • us-east-1
              </p>
              <div className="h-1 w-1 rounded-full bg-border" />
              <p className="text-[11px] font-bold text-muted uppercase tracking-[0.2em]">Shard: Ingress-01</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleExport}
             disabled={isExporting}
             className="btn-secondary h-10 border-strong group"
           >
              {isExporting ? <Activity className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="ml-2">Export State</span>
           </button>
           <button 
              onClick={() => setShowWidgetMarketplace(true)}
              className="btn-primary h-10 shadow-xl shadow-black/5"
           >
              <Plus className="h-4 w-4" />
              <span className="ml-2">Provision Module</span>
           </button>
        </div>
      </div>

      {/* Primary KPI Matrix */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ icon: Icon, ...kpi }) => (
          <div key={kpi.label} 
               onClick={() => navigate(kpi.href)}
               className="enterprise-card p-6 cursor-pointer border-strong/40 group hover:border-black active:scale-[0.98] transition-all">
            <div className="flex justify-between items-start mb-6">
               <div className="h-10 w-10 bg-black text-white rounded flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Icon className="h-5 w-5" />
               </div>
               <span className={cn(
                 "status-badge",
                 kpi.status === 'OPTIMIZED' ? "badge-success" : 
                 kpi.status === 'STABLE' ? "badge-info" : "badge-warning"
               )}>{kpi.status}</span>
            </div>
            <div className="space-y-1">
               <div className="text-[11px] font-black uppercase tracking-[0.15em] text-muted">{kpi.label}</div>
               <div className="flex items-end justify-between">
                  <div className="text-3xl font-black tracking-tighter text-black">{kpi.val}</div>
                  <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                     {kpi.trend}
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Core Telemetry Feed */}
        <div className="lg:col-span-8">
           <div className="flex items-center justify-between mb-6">
              <div className="space-y-0.5">
                 <h2 className="text-xl font-black tracking-tight text-black flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" /> Cluster Ingress Stream
                 </h2>
                 <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Weighted Signal Throughput • 24h Window</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-black" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Live Flow</span>
              </div>
           </div>
           <div className="h-[360px] p-6 border border-strong rounded-lg bg-surface-alt/20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.performanceSeries || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                  <XAxis dataKey="time" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10, fontWeight: 900}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '0px', border: '1px solid #000', boxShadow: '10px 10px 0px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }} 
                  />
                  <Area type="stepAfter" dataKey="value" stroke="#000" strokeWidth={2} fill="#F5F5F5" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Tactical Triage Support */}
        <div className="lg:col-span-4">
           <div className="space-y-0.5 mb-6">
              <h2 className="text-xl font-black tracking-tight text-black flex items-center gap-2">
                 <AlertTriangle className="h-5 w-5" /> Alert Logic
              </h2>
              <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Weighted Distribution Tiering</p>
           </div>
           <div className="space-y-4">
              {(stats?.severityDistribution || []).map((entry: any) => (
                <div key={entry.name} 
                     onClick={() => navigate('/incidents')}
                     className="p-5 border border-border-strong rounded hover:border-black hover:bg-surface-alt transition-all cursor-pointer group flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className={cn("h-2 w-2 rounded-full", 
                         entry.name === 'P1' ? "bg-red-600" : 
                         entry.name === 'P2' ? "bg-amber-500" : "bg-black")} 
                      />
                      <div className="flex flex-col">
                         <span className="text-[12px] font-black text-black uppercase tracking-widest">{entry.name} Priority</span>
                         <span className="text-[9px] font-bold text-muted uppercase">Global Command Required</span>
                      </div>
                   </div>
                   <div className="text-2xl font-black text-black group-hover:translate-x-[-4px] transition-transform">{entry.count}</div>
                </div>
              ))}
              
              <div className="p-6 bg-black rounded text-white space-y-4">
                 <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Autonomous SRE Status</span>
                 </div>
                 <p className="text-[12px] font-medium leading-relaxed opacity-60">
                    AI Agent currently monitoring 14,291 signals. No automated remediation required in the last 120 minutes.
                 </p>
                 <button onClick={() => navigate('/ai-insights')} className="w-full h-10 border border-white/20 hover:bg-white hover:text-black rounded text-[10px] font-black uppercase tracking-widest transition-all">
                    View Agent Logic
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Intelligence & Audit Feed */}
      <div className="space-y-6">
         <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-black tracking-tight text-black flex items-center gap-2">
               <Globe className="h-5 w-5" /> Strategic Infrastructure Matrix
            </h2>
            <button onClick={() => navigate('/infrastructure')} className="text-[10px] font-black text-muted hover:text-black uppercase tracking-widest flex items-center gap-2 transition-colors">
               Full Topology <ChevronRight className="h-4 w-4" />
            </button>
         </div>
         <div className="enterprise-table-container">
            <table className="enterprise-table">
               <thead>
                  <tr>
                     <th>Entity Origin</th>
                     <th>Intelligence Reasoning & Live Context</th>
                     <th className="text-right">Risk Score</th>
                     <th className="w-40 text-right">Action</th>
                  </tr>
               </thead>
               <tbody>
                  {(stats?.riskProfiles || []).map((item: any, idx: number) => (
                     <tr key={idx} className="group">
                        <td className="font-black uppercase tracking-widest whitespace-nowrap">{item.type} Signal</td>
                        <td className="py-4 font-medium text-muted leading-relaxed italic pr-10">
                           {item.context}
                        </td>
                        <td className="text-right">
                           <span className="font-mono text-lg font-black text-black">{item.conf}</span>
                        </td>
                        <td className="text-right">
                           <button onClick={() => navigate('/ai-chat')} className="h-8 px-4 border border-black rounded text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                              Deep Analysis
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
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-white rounded border border-black shadow-[20px_20px_0px_rgba(0,0,0,0.1)] overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
              <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                 <div className="space-y-1">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-black">Module Provisioning</h2>
                    <p className="text-[11px] text-muted font-bold uppercase tracking-widest">Deploy new intelligence modules to command console</p>
                 </div>
                 <button onClick={() => setShowWidgetMarketplace(false)} className="p-2 hover:bg-surface-alt rounded-full transition-colors">
                    <X className="h-6 w-6" />
                 </button>
              </div>
              <div className="p-10 grid grid-cols-2 gap-6">
                 {[
                   { name: 'Node Topology', icon: Terminal },
                   { name: 'Alert Correlation', icon: Activity },
                   { name: 'Financial Ops', icon: Layout },
                   { name: 'Security Posture', icon: ShieldCheck },
                   { name: 'Network Latency', icon: Server },
                   { name: 'AI Forecast', icon: Zap }
                 ].map(({ icon: Icon, ...w }) => (
                   <div key={w.name} className="p-6 border border-border rounded hover:border-black cursor-pointer group transition-all hover:bg-surface-alt flex flex-col items-center text-center gap-4">
                      <div className="h-12 w-12 bg-black text-white rounded flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                         <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-black">{w.name}</span>
                   </div>
                 ))}
              </div>
              <div className="px-8 py-6 bg-surface-alt border-t border-border flex justify-end gap-3">
                 <button onClick={() => setShowWidgetMarketplace(false)} className="btn-secondary">Abort</button>
                 <button onClick={() => setShowWidgetMarketplace(false)} className="btn-primary">Provision Strategy</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
