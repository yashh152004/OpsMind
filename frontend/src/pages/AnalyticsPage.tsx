import React from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, AreaChart, Area
} from 'recharts'
import { 
  Target, Users, TrendingUp, History, Calendar, Download, Activity,
  ChevronRight, BrainCircuit, BarChart3, Clock, Gauge
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { cn } from '@/utils/cn'

const AnalyticsPage: React.FC = () => {
  const { data: trends, isLoading } = useQuery({
    queryKey: ['analytics-trends'],
    queryFn: () => apiClient.getAnalyticsTrends(),
    refetchInterval: 60000
  })

  return (
    <div className="page-transition-fade space-y-10 p-10 bg-white min-h-screen">
      {/* Strategic Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tighter text-black m-0 font-geist">Analytics</h1>
           <div className="flex items-center gap-4">
              <p className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                 <BarChart3 className="h-4 w-4 text-black" /> SLO Tracking & Performance Intelligence
              </p>
              <div className="h-4 w-[1px] bg-border" />
              <p className="text-[10px] font-bold text-black uppercase tracking-widest">Window: 30 Days</p>
           </div>
        </div>
        <button className="btn-secondary h-10 border-strong group">
           <Download className="h-4 w-4" />
           <span className="ml-2">Generate Report</span>
        </button>
      </div>

      {/* Strategic KPIs */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'SLO Compliance (Aggregate)', val: '99.94%', delta: '-0.01%', icon: Target, status: 'NOMINAL' },
          { label: 'MTTR (Mean-Time-To-Resolve)', val: '24m 12s', delta: '↓ 15.2%', icon: History, status: 'IMPROVING' },
          { label: 'Autonomous Remediation Rate', val: '82.4%', delta: '+22.4%', icon: BrainCircuit, status: 'OPTIMIZED' },
        ].map(kpi => (
          <div key={kpi.label} className="enterprise-card p-6 border-strong/40 group hover:border-black transition-all">
            <div className="flex justify-between items-start mb-6">
               <div className="h-10 w-10 bg-black text-white rounded flex items-center justify-center shadow-lg">
                  <kpi.icon className="h-5 w-5" />
               </div>
               <span className="status-badge badge-success">{kpi.status}</span>
            </div>
            <div className="space-y-1">
               <div className="text-[11px] font-black uppercase tracking-widest text-muted">{kpi.label}</div>
               <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-black text-black tracking-tighter">{kpi.val}</div>
                  <div className="text-[10px] font-black text-emerald-600 font-mono italic">{kpi.delta}</div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* MTTR Volatility Loop */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-black uppercase tracking-widest mb-0 border-none flex items-center gap-2">
                 <TrendingUp className="h-4.5 w-4.5" /> MTTR Variance Analysis
              </h3>
              <span className="text-[9px] font-black text-muted uppercase tracking-widest">Ref: Logic-01</span>
           </div>
           <div className="h-[340px] p-6 border border-strong rounded bg-surface-alt/20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends?.mttrTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10, fontWeight: 900}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10, fontWeight: 900}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '0px', border: '1px solid #000', boxShadow: '5px 5px 0px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }} 
                  />
                  <Area type="monotone" dataKey="time" stroke="#000" strokeWidth={2.5} fill="#F5F5F5" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Global Cluster Health */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-black uppercase tracking-widest mb-0 border-none flex items-center gap-2">
                 <Gauge className="h-4.5 w-4.5" /> Node Health Distribution
              </h3>
              <span className="text-[9px] font-black text-muted uppercase tracking-widest">Target: Production</span>
           </div>
           <div className="h-[340px] p-6 border border-strong rounded bg-surface-alt/20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends?.serviceHealth || []}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5E5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10, fontWeight: 900}} />
                  <YAxis domain={[95, 100]} axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 10, fontWeight: 900}} />
                  <Tooltip 
                     cursor={{fill: '#F5F5F5'}}
                     contentStyle={{ borderRadius: '0px', border: '1px solid #000', boxShadow: '5px 5px 0px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="value" radius={[0, 0, 0, 0]} barSize={40}>
                    {(trends?.serviceHealth || []).map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={entry.value > 99.9 ? '#000' : '#888'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Engineering Velocity Matrix */}
      <div className="space-y-6">
         <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-black tracking-tight text-black flex items-center gap-2">
               <Users className="h-5 w-5" /> Team Resolution Velocity
            </h2>
         </div>
         <div className="grid gap-6 md:grid-cols-3">
            {(trends?.teamPerformance || []).map((team: any) => (
               <div key={team.team} className="p-8 border border-strong rounded bg-white hover:border-black transition-all group">
                  <div className="text-[11px] font-black text-muted uppercase tracking-[0.2em] mb-4 group-hover:text-black transition-colors">{team.team} Squad</div>
                  <div className="flex items-end justify-between">
                     <div className="text-3xl font-black text-black tracking-tighter">{team.resolved} <span className="text-[10px] text-muted font-bold">Solved</span></div>
                     <div className="text-[10px] text-black font-black uppercase tracking-widest bg-surface-alt px-2 py-1 rounded">Avg: {team.avgTime}</div>
                  </div>
                  <div className="mt-6 h-1 w-full bg-surface-alt rounded-full overflow-hidden">
                     <div className="h-full bg-black w-[84%] transition-all duration-1000" />
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
