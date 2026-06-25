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
    <div className="space-y-6 pb-12 page-transition">
      {/* Analytics Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
           <h1 className="text-xl font-black text-slate-900 tracking-tight">Systems Performance Analysis</h1>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 Long-term operational efficacy and SLO modeling
              </span>
           </div>
        </div>
        <button className="btn-secondary h-8 px-3 text-[10px] font-black uppercase tracking-wider">
           <Download className="h-3.5 w-3.5" /> PDF Report
        </button>
      </div>

      {/* Analytics KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Observed SLO Compliance', val: '99.94%', delta: '-0.01%', color: 'text-blue-600', icon: Target },
          { label: 'Mean Resolution Latency', val: '24m 12s', delta: '↓ 15.2%', color: 'text-emerald-600', icon: History },
          { label: 'AI Mitigated Signals', val: '142', delta: '+22.4%', color: 'text-slate-900', icon: Activity },
        ].map(kpi => (
          <div key={kpi.label} className="enterprise-card p-4 flex flex-col justify-between h-28 border-t-2 border-t-slate-100">
            <div className="flex justify-between items-start">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</span>
               <kpi.icon className="h-3.5 w-3.5 text-slate-300" />
            </div>
            <div className="flex items-baseline gap-3">
               <div className={cn("text-2xl font-black metric-mono", kpi.color)}>{kpi.val}</div>
               <div className="text-[9px] font-bold text-emerald-500">{kpi.delta}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* MTTR Volatility */}
        <div className="enterprise-card p-0 overflow-hidden">
           <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.12em] flex items-center gap-2">
                 <TrendingUp className="h-3.5 w-3.5 text-blue-600" /> MTTR Latency Volatility
              </span>
           </div>
           <div className="p-6 h-[300px]">
             {isLoading ? <div className="h-full w-full skeleton" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends?.mttrTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                  <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #E2E8F0', boxShadow: 'none', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="time" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
             )}
           </div>
        </div>

        {/* Infrastructure Efficacy */}
        <div className="enterprise-card p-0 overflow-hidden">
           <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.12em] flex items-center gap-2">
                 <Calendar className="h-3.5 w-3.5 text-emerald-500" /> Multi-Shard Availability
              </span>
           </div>
           <div className="p-6 h-[300px]">
             {isLoading ? <div className="h-full w-full skeleton" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends?.serviceHealth || []}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 9}} dy={5} />
                  <YAxis domain={[95, 100]} axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                  <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #E2E8F0', boxShadow: 'none', fontSize: '11px' }} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={28}>
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

      {/* Engineer Velocity */}
      <div className="enterprise-card p-0 overflow-hidden">
         <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.12em] flex items-center gap-2">
               <Users className="h-3.5 w-3.5 text-slate-400" /> SRE Operational Velocity
            </span>
         </div>
         <div className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
               {(trends?.teamPerformance || []).map((team: any) => (
                 <div key={team.team} className="p-4 rounded border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-blue-200 transition-all">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{team.team}</div>
                    <div className="flex items-end justify-between">
                       <div className="text-xl font-black text-slate-900 metric-mono">{team.resolved}</div>
                       <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">Avg: {team.avgTime}</div>
                    </div>
                    <div className="mt-3 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600 w-[72%]" />
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
