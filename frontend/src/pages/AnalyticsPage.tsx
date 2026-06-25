import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts'
import { 
  Target, 
  Users, 
  TrendingUp,
  History,
  Calendar,
  Download,
  Activity
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { cn } from '@/utils/cn'

const AnalyticsPage: React.FC = () => {
  const { data: trends, isLoading } = useQuery({
    queryKey: ['analytics-trends'],
    queryFn: () => apiClient.getAnalyticsTrends()
  })

  return (
    <div className="main-content-grid page-transition-fade">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
           <h1 className="text-page-title">Performance Analytics</h1>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-helper font-medium">
                 Long-term operational trends and SLO compliance modeling
              </span>
           </div>
        </div>
        <button className="btn-secondary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">
           <Download className="h-3.5 w-3.5 mr-1.5" /> Export Report
        </button>
      </div>

      {/* Analytics KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'SLO Compliance', val: '99.94%', delta: '-0.01%', color: 'text-accent', icon: Target },
          { label: 'Mean Resolution Time', val: '24m 12s', delta: '↓ 15.2%', color: 'text-success', icon: History },
          { label: 'AI Resolution Rate', val: '82.4%', delta: '+22.4%', color: 'text-primary', icon: Activity },
        ].map(kpi => (
          <div key={kpi.label} className="enterprise-card p-4 hover-lift">
            <div className="flex justify-between items-start mb-2">
               <span className="text-metric-label">{kpi.label}</span>
               <kpi.icon className="h-3.5 w-3.5 text-muted" />
            </div>
            <div className="flex items-baseline gap-3">
               <div className={cn("text-2xl metric-value", kpi.color)}>{kpi.val}</div>
               <div className="text-[10px] font-bold text-success font-mono">{kpi.delta}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* MTTR Volatility */}
        <div className="enterprise-card overflow-hidden">
           <div className="px-5 py-3 border-b border-border bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-section-title flex items-center gap-2">
                 <TrendingUp className="h-3.5 w-3.5 text-accent" /> MTTR Trend Analysis
              </h3>
           </div>
           <div className="p-6 h-[300px]">
             {isLoading ? <div className="h-full w-full animate-pulse bg-slate-50" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends?.mttrTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                  <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #E2E8F0', boxShadow: 'none', fontSize: '11px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="time" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
             )}
           </div>
        </div>

        {/* Infrastructure Efficacy */}
        <div className="enterprise-card overflow-hidden">
           <div className="px-5 py-3 border-b border-border bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-section-title flex items-center gap-2">
                 <Calendar className="h-3.5 w-3.5 text-success" /> Service Health Distribution
              </h3>
           </div>
           <div className="p-6 h-[300px]">
             {isLoading ? <div className="h-full w-full animate-pulse bg-slate-50" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends?.serviceHealth || []}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} dy={10} />
                  <YAxis domain={[95, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10}} />
                  <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #E2E8F0', boxShadow: 'none', fontSize: '11px', fontWeight: 'bold' }} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={32}>
                    {(trends?.serviceHealth || []).map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={entry.value > 99.9 ? '#10B981' : '#F59E0B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
             )}
           </div>
        </div>
      </div>

      {/* Team Velocity */}
      <div className="enterprise-card overflow-hidden">
         <div className="px-5 py-3 border-b border-border bg-slate-50/50">
            <h3 className="text-section-title flex items-center gap-2">
               <Users className="h-3.5 w-3.5 text-muted" /> Response Team Velocity
            </h3>
         </div>
         <div className="p-5">
            <div className="grid gap-4 md:grid-cols-3">
               {(trends?.teamPerformance || []).map((team: any) => (
                 <div key={team.team} className="p-4 rounded-sm border border-border bg-slate-50/30 hover-lift">
                    <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">{team.team}</div>
                    <div className="flex items-end justify-between">
                       <div className="text-xl metric-value">{team.resolved}</div>
                       <div className="text-[10px] text-success font-bold uppercase tracking-wider">Avg: {team.avgTime}</div>
                    </div>
                    <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-accent w-[72%]" />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  )
}


export default AnalyticsPage
