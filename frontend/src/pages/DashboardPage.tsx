import React, { useState } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { 
  Activity, AlertTriangle, ShieldCheck, 
  Plus, Download, FileText, Layout, Info, TrendingUp, TrendingDown
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import Widget from '@/components/Widget'
import { toast } from 'sonner'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [isExporting, setIsExporting] = useState(false)
  const [showWidgetMarketplace, setShowWidgetMarketplace] = useState(false)

  const { data: stats, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
    refetchInterval: 15000
  })

  const handleExport = async (format: string) => {
    setIsExporting(true)
    try {
      const data = await apiClient.exportModule('incidents') // Defaulting to incidents report
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `OpsMind_Status_Report_${new Date().toISOString().split('T')[0]}.${format}`)
      document.body.appendChild(link)
      link.click()
      toast.success(`Platform state exported as ${format.toUpperCase()}`)
    } catch (e) {
      toast.error("Export failed. Internal compute engine busy.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="main-content-grid page-transition-fade space-y-6">
      {/* Platform Orchestration Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <Layout className="h-5 w-5 text-accent" />
             <h1 className="text-xl font-bold tracking-tight text-primary m-0">Executive Command Center</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-success/10 text-success rounded-[2px] text-[10px] font-black tracking-widest uppercase">
                <span className="h-1 w-1 rounded-full bg-success animate-pulse" />
                Live: 100% Connectivity
             </div>
             <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Shard: us-east-1-cluster-alpha</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative group/export">
               <button className={cn("btn-secondary h-8 px-4 text-[10px] uppercase font-black tracking-widest group", isExporting && "opacity-50")}>
                  {isExporting ? <Activity className="h-3.5 w-3.5 animate-spin mr-2" /> : <Download className="h-3.5 w-3.5 mr-2" />}
                  Export Report
               </button>
               <div className="absolute top-full right-0 mt-1 bg-white border border-border shadow-2xl rounded-[2px] p-1 invisible group-hover/export:visible z-[100] min-w-[140px] animate-in fade-in slide-in-from-top-1 duration-200">
                  {['pdf', 'excel', 'csv'].map(fmt => (
                    <button key={fmt} onClick={() => handleExport(fmt)} className="w-full text-left px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 text-secondary flex items-center justify-between">
                       {fmt} <FileText className="h-3 w-3 opacity-30" />
                    </button>
                  ))}
               </div>
            </div>
            <button 
              onClick={() => setShowWidgetMarketplace(true)}
              className="btn-primary h-8 px-4 text-[10px] uppercase font-black tracking-widest shadow-lg shadow-accent/20"
            >
               <Plus className="h-4 w-4 mr-1.5" /> Add Widget
            </button>
        </div>
      </div>

      {/* KPI Drill-down Matrix */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Platform Availability', val: stats?.uptime || '99.99%', color: 'text-success', trend: '+0.01%', status: 'UP', icon: Activity, href: '/infrastructure' },
          { label: 'Active Incidents', val: stats?.activeIncidents || '0', color: 'text-primary', trend: 'STABLE', status: 'NOMINAL', icon: AlertTriangle, href: '/incidents' },
          { label: 'Avg System Latency', val: stats?.mttr || '12.4ms', color: 'text-accent', trend: '-2.1ms', status: 'IMPROVING', icon: Cpu, href: '/analytics' },
          { label: 'SLA Fulfillment', val: '100.0%', color: 'text-primary', trend: 'STABLE', status: 'COMPLIANT', icon: ShieldCheck, href: '/analytics' },
        ].map(kpi => (
          <div key={kpi.label} 
               onClick={() => navigate(kpi.href)}
               className="enterprise-card p-4 hover-lift cursor-pointer group hover:border-accent/50 transition-all">
            <div className="flex justify-between items-start mb-1.5">
               <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted group-hover:text-accent transition-colors">{kpi.label}</span>
                  <Info className="h-3 w-3 text-muted/20" />
               </div>
               <kpi.icon className="h-4 w-4 text-muted/30 group-hover:text-accent group-hover:rotate-12 transition-all" />
            </div>
            <div className="flex items-end justify-between">
               <div className={cn("text-2xl font-black tracking-tighter", kpi.color)}>{kpi.val}</div>
               <div className="flex flex-col items-end">
                  <div className={cn("flex items-center gap-0.5 text-[10px] font-black uppercase tracking-tighter", kpi.trend.startsWith('+') ? "text-success" : kpi.trend.startsWith('-') ? "text-critical" : "text-muted")}>
                     {kpi.trend.startsWith('+') ? <TrendingUp className="h-3 w-3" /> : kpi.trend.startsWith('-') ? <TrendingDown className="h-3 w-3" /> : null}
                     {kpi.trend}
                  </div>
                  <span className="text-[8px] font-bold text-muted/50 uppercase tracking-widest whitespace-nowrap">vs Previous 24h</span>
               </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
               <span className="text-[9px] font-bold text-muted uppercase tracking-widest">{kpi.status} STATE</span>
               <span className="text-[9px] font-black text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Analyze &rarr;</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Performance Graph Widget */}
        <div className="lg:col-span-8">
          <Widget 
            title="SRE Infrastructure Health Trend" 
            icon={Activity} 
            onRefresh={() => refetch()}
            isLoading={isLoading || isRefetching}
          >
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.performanceSeries || []}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="time" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '2px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }} 
                  />
                  <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fill="url(#chartGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Widget>
        </div>

        {/* Severity Widget */}
        <div className="lg:col-span-4">
          <Widget 
            title="Incident Severity Distribution" 
            icon={AlertTriangle}
            onRefresh={() => refetch()}
            isLoading={isLoading}
          >
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.severityDistribution || []} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" hide />
                  <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={24}>
                    {(stats?.severityDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'P1' ? '#EF4444' : entry.name === 'P2' ? '#F59E0B' : '#2563EB'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
               {(stats?.severityDistribution || [
                 { name: 'P1', count: 0 }, { name: 'P2', count: 0 }, { name: 'P3', count: 0 }
               ]).map((entry: any) => (
                 <div key={entry.name} className="flex items-center justify-between p-2 rounded-sm hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                       <span className={cn("h-2 w-2 rounded-[1px]", entry.name === 'P1' ? "bg-critical" : entry.name === 'P2' ? "bg-warning" : "bg-accent")} />
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{entry.name} Critical</span>
                    </div>
                    <span className="metric-value text-[12px]">{entry.count}</span>
                 </div>
               ))}
            </div>
          </Widget>
        </div>
      </div>

      {/* AI Operational Intelligence Platform */}
      <Widget title="AI Operational Intelligence Orchestrator" icon={ShieldCheck}>
         <div className="enterprise-table-container border-none shadow-none">
           <table className="enterprise-table">
              <thead>
                 <tr>
                    <th className="w-32">Classification</th>
                    <th>Intelligence Reasoning & Root Cause Analysis</th>
                    <th className="w-24 text-right">Confidence</th>
                    <th className="w-32 text-right">Operational State</th>
                 </tr>
              </thead>
              <tbody>
                 {(stats?.riskProfiles || [
                    { id: 1, type: 'Nominal', context: 'Infrastructure nodes operating within baseline constraints. Predictive models suggest 99.9% availability for next 24h.', conf: '99.4%', status: 'STEADY' },
                    { id: 2, type: 'Warning', context: 'Unusual query latency pattern detected in DB-Shard-B. Matching patterns for potential indexing degradation.', conf: '88.1%', status: 'OBSERVING' },
                    { id: 3, type: 'Critical', context: 'Security finding SEC-948: Unauthenticated access attempt blocked from unknown IP range in us-west-2.', conf: '94.2%', status: 'BLOCKED' }
                 ]).map((item: any, idx: number) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                       <td>
                          <span className={cn(
                            "status-badge",
                            item.type === 'Critical' ? "badge-critical" : item.type === 'Warning' ? "badge-warning" : "badge-success"
                          )}>{item.type}</span>
                       </td>
                       <td className="text-[12px] font-medium text-secondary py-3">{item.context}</td>
                       <td className="metric-value text-[11px] text-right">{item.conf}</td>
                       <td className="text-right">
                          <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{item.status}</span>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
         </div>
      </Widget>

      {/* Widget Marketplace Modal Placeholder */}
      {showWidgetMarketplace && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-2xl bg-white rounded-[2px] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border bg-slate-50 flex items-center justify-between">
                 <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-primary">Widget Inventory Orchestrator</h2>
                    <p className="text-[10px] text-muted font-medium mt-0.5 uppercase tracking-widest">Select operational modules to pin to console</p>
                 </div>
                 <button onClick={() => setShowWidgetMarketplace(false)} className="text-muted hover:text-primary transition-colors">
                    <AlertTriangle className="h-5 w-5 rotate-45" />
                 </button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                 {[
                   { name: 'Infrastructure Topology', desc: 'Real-time node dependency mapping', icon: Activity },
                   { name: 'Alert Correlation', desc: 'Weighted alert stream analytics', icon: ShieldCheck },
                   { name: 'Financial Ops', desc: 'Cloud spent vs performance ratio', icon: Layout },
                   { name: 'Security Posture', desc: 'CVE compliance & risk score', icon: ShieldCheck },
                   { name: 'Network Latency', desc: 'Regional P99 threshold monitoring', icon: Cpu },
                   { name: 'AI Forecast', desc: 'Capacity planning simulation', icon: TrendingUp }
                 ].map(w => (
                   <div key={w.name} className="p-4 border border-border rounded-[2px] hover:border-accent cursor-pointer group transition-all">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="h-8 w-8 bg-slate-50 rounded-[2px] flex items-center justify-center text-muted group-hover:bg-accent group-hover:text-white transition-all">
                            <w.icon className="h-4 w-4" />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-primary">{w.name}</span>
                      </div>
                      <p className="text-[10px] text-muted leading-relaxed font-medium">{w.desc}</p>
                   </div>
                 ))}
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-border flex justify-end gap-3">
                 <button onClick={() => setShowWidgetMarketplace(false)} className="btn-secondary h-9 px-6 text-[10px] font-black uppercase tracking-widest">Cancel</button>
                 <button onClick={() => setShowWidgetMarketplace(false)} className="btn-primary h-9 px-6 text-[10px] font-black uppercase tracking-widest">Provision Widgets</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
