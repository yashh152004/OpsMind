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
    <div className="space-y-6 pb-10 page-transition">
      {/* Executive Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Executive Intelligence Overview</h1>
          <div className="flex items-center gap-3 mt-1">
             <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Connectivity: 100%
             </span>
             <span className="text-[10px] text-slate-400 font-medium">Last Sync: Just now</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="btn-secondary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">Export PDF</button>
            <button className="btn-primary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">Configure Layout</button>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Cluster Uptime', val: stats?.uptime || '99.982%', color: 'text-emerald-600', trend: '+0.012%' },
          { label: 'Active Incidents', val: stats?.activeIncidents || '00', color: 'text-slate-900', trend: '-2' },
          { label: 'Latency (Avg)', val: stats?.mttr || '12.4ms', color: 'text-blue-600', trend: '-2.1ms' },
          { label: 'SLA Fulfillment', val: '100.0%', color: 'text-slate-900', trend: 'STABLE' },
        ].map(kpi => (
          <div key={kpi.label} className="enterprise-card p-4 flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{kpi.label}</span>
               <span className="text-[9px] font-bold text-slate-400 font-mono">{kpi.trend}</span>
            </div>
            <div className={cn("text-3xl font-black metric-mono", kpi.color)}>{kpi.val}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Telemetry Graph */}
        <div className="enterprise-card p-0 lg:col-span-8 overflow-hidden">
           <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] flex items-center gap-2">
                 <Activity className="h-3.5 w-3.5 text-blue-600" /> System Efficacy Gradient
              </span>
              <div className="flex gap-2">
                 {['1H', '6H', '24H', '7D'].map(t => (
                   <button key={t} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", t === '1H' ? "bg-slate-200 text-slate-900" : "text-slate-400 hover:text-slate-600")}>{t}</button>
                 ))}
              </div>
           </div>
           <div className="p-6 h-[380px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={stats?.performanceSeries || []}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                 <XAxis dataKey="time" hide />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                 <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #E2E8F0', boxShadow: 'none', fontSize: '12px' }} />
                 <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fill="#2563EB" fillOpacity={0.05} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Severity Distribution */}
        <div className="enterprise-card p-0 lg:col-span-4 overflow-hidden">
           <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] flex items-center gap-2">
                 <AlertTriangle className="h-3.5 w-3.5 text-orange-500" /> Severity Concentration
              </span>
           </div>
           <div className="p-6">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.severityDistribution || []} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                      {(stats?.severityDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'P1' ? '#EF4444' : entry.name === 'P2' ? '#F59E0B' : '#2563EB'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-4">
                 {(stats?.severityDistribution || []).map((entry: any) => (
                   <div key={entry.name} className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-2">
                         <span className={cn("h-2 w-2 rounded-full", entry.name === 'P1' ? "bg-red-500" : entry.name === 'P2' ? "bg-orange-500" : "bg-blue-500")} />
                         <span className="text-slate-500 uppercase tracking-widest">{entry.name} Incidents</span>
                      </div>
                      <span className="metric-mono">{entry.count}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Autonomous Reasoning Feed */}
      <div className="enterprise-card p-0 overflow-hidden">
         <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.15em] flex items-center gap-2">
               <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> AI Contextual Analysis
            </span>
            <div className="status-badge badge-info">V3.0 Engine Active</div>
         </div>
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th>Risk Profile</th>
                  <th>Autonomous Intelligence Reasoning Context</th>
                  <th>Confidence</th>
                  <th>Logic State</th>
                  <th className="text-right">Action</th>
               </tr>
            </thead>
            <tbody>
               {(stats?.riskProfiles || [
                  { id: 1, type: 'Nominal', context: 'Infrastructure nodes operating within baseline throughput constraints. No anomalies.', conf: '99.4%', status: 'STABLE' },
                  { id: 2, type: 'Warning', context: 'Elevated CPU throttling in us-east-1a shard. Investigating potential memory leak.', conf: '88.1%', status: 'REASONING' },
                  { id: 3, type: 'Critical', context: 'Health probe failure on Auth-Service. Potential cascading auth fallout detected.', conf: '94.2%', status: 'TRIGGERED' }
               ]).map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                     <td className="w-32">
                        <span className={cn(
                          "status-badge",
                          item.type === 'Critical' ? "badge-critical" : item.type === 'Warning' ? "badge-warning" : "badge-success"
                        )}>{item.type}</span>
                     </td>
                     <td className="font-medium text-slate-600">{item.context}</td>
                     <td className="metric-mono text-xs">{item.conf}</td>
                     <td className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.status}</td>
                     <td className="text-right">
                        <button className="btn-ghost"><ExternalLink className="h-3.5 w-3.5" /></button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  )
}

export default DashboardPage
