import React from 'react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { 
  Activity,
  AlertTriangle, 
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { cn } from '@/utils/cn'

const DashboardPage: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
    refetchInterval: 15000
  })

  return (
    <div className="main-content-grid page-transition-fade">
      {/* Executive Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-page-title">Executive Overview</h1>
          <div className="flex items-center gap-3 mt-1">
             <span className="status-badge badge-success">
                <span className="h-1 w-1 rounded-full bg-success mr-1.5" />
                Connectivity: 100%
             </span>
             <span className="text-helper font-medium">Last updated: Just now</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="btn-secondary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">
               <ExternalLink className="h-3.5 w-3.5 mr-1" /> Export Report
            </button>
            <button className="btn-primary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">
               Add Widget
            </button>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Cluster Uptime', val: stats?.uptime || '99.99%', color: 'text-success', trend: '+0.01%', icon: Activity },
          { label: 'Active Incidents', val: stats?.activeIncidents || '0', color: 'text-primary', trend: 'UNCHANGED', icon: AlertTriangle },
          { label: 'Avg Latency', val: stats?.mttr || '12.4ms', color: 'text-accent', trend: '-2.1ms', icon: Cpu },
          { label: 'SLA Fulfillment', val: '100.0%', color: 'text-primary', trend: 'STABLE', icon: ShieldCheck },
        ].map(kpi => (
          <div key={kpi.label} className="enterprise-card p-4 hover-lift">
            <div className="flex justify-between items-start mb-2">
               <span className="text-metric-label">{kpi.label}</span>
               <kpi.icon className="h-3.5 w-3.5 text-muted/40" />
            </div>
            <div className={cn("text-2xl metric-value", kpi.color)}>{kpi.val}</div>
            <div className="mt-2 text-[10px] font-bold text-muted uppercase tracking-wider flex items-center">
               <span className={cn(kpi.trend.startsWith('+') ? "text-success" : kpi.trend.startsWith('-') ? "text-critical" : "text-muted")}>
                  {kpi.trend}
               </span>
               <span className="ml-1 text-muted/60 font-medium">vs Last 24h</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Performance Graph */}
        <div className="enterprise-card lg:col-span-8">
           <div className="enterprise-card-header">
              <span className="text-section-title flex items-center gap-2">
                 <Activity className="h-3.5 w-3.5 text-accent" /> Infrastructure Health Trend
              </span>
              <div className="flex gap-1.5">
                 {['1H', '6H', '24H', '7D'].map(t => (
                   <button key={t} className={cn("text-[9px] font-bold px-2 py-0.5 rounded border transition-colors", t === '1H' ? "bg-secondary text-white border-secondary" : "bg-white text-muted border-border hover:bg-slate-50")}>{t}</button>
                 ))}
              </div>
           </div>
           <div className="p-4 h-[320px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={stats?.performanceSeries || []}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.8} />
                 <XAxis dataKey="time" hide />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                 <Tooltip contentStyle={{ borderRadius: '2px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }} />
                 <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={1.5} fill="#2563EB" fillOpacity={0.08} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Severity Distribution */}
        <div className="enterprise-card lg:col-span-4">
           <div className="enterprise-card-header">
              <span className="text-section-title flex items-center gap-2">
                 <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Incident Severity
              </span>
           </div>
           <div className="p-4">
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
              <div className="mt-4 space-y-3">
                 {(stats?.severityDistribution || []).map((entry: any) => (
                   <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <span className={cn("h-1.5 w-1.5 rounded-full", entry.name === 'P1' ? "bg-critical" : entry.name === 'P2' ? "bg-warning" : "bg-accent")} />
                         <span className="text-[11px] font-bold text-muted uppercase tracking-widest">{entry.name} CRITICAL</span>
                      </div>
                      <span className="metric-value text-xs">{entry.count}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* AI Recommendations & Critical Findings */}
      <div className="enterprise-card">
         <div className="enterprise-card-header">
            <span className="text-section-title flex items-center gap-2">
               <ShieldCheck className="h-3.5 w-3.5 text-accent" /> AI Operational Intelligence
            </span>
            <div className="status-badge badge-info">V3.0 Engine Active</div>
         </div>
         <div className="enterprise-table-container">
           <table className="enterprise-table">
              <thead>
                 <tr>
                    <th className="w-32">Severity</th>
                    <th>Intelligence Reasoning & Insight</th>
                    <th className="w-24">Confidence</th>
                    <th className="w-32">Logic State</th>
                    <th className="w-16 text-right">Action</th>
                 </tr>
              </thead>
              <tbody>
                 {(stats?.riskProfiles || [
                    { id: 1, type: 'Nominal', context: 'Infrastructure nodes operating within baseline constraints. No anomalies detected.', conf: '99.4%', status: 'STABLE' },
                    { id: 2, type: 'Warning', context: 'High CPU wait time in us-east-c shard. Potential storage bottleneck identified.', conf: '88.1%', status: 'ANALYZING' },
                    { id: 3, type: 'Critical', context: 'Memory exhaustion imminent on Auth-Service cluster. Auto-scaling recommended.', conf: '94.2%', status: 'RECOVERY' }
                 ]).map((item: any) => (
                    <tr key={item.id}>
                       <td>
                          <span className={cn(
                            "status-badge",
                            item.type === 'Critical' ? "badge-critical" : item.type === 'Warning' ? "badge-warning" : "badge-success"
                          )}>{item.type}</span>
                       </td>
                       <td className="text-[13px] font-medium text-secondary">{item.context}</td>
                       <td className="metric-value text-[11px]">{item.conf}</td>
                       <td>
                          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{item.status}</span>
                       </td>
                       <td className="text-right">
                          <button className="btn-ghost" title="View Details"><ExternalLink className="h-3.5 w-3.5" /></button>
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


export default DashboardPage
