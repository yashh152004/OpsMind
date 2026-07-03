import React from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, AreaChart, Area
} from 'recharts'
import { 
  Target, Users, TrendingUp, History, Calendar, Download, Activity,
  ChevronRight, BrainCircuit, BarChart3, Clock, Gauge, Filter, 
  ArrowUpRight, ArrowDownRight, Layers, LayoutPanelLeft
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
    <div className="page-transition-fade space-y-8 p-6 lg:p-8 bg-background min-h-screen">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold tracking-tight text-foreground m-0">Performance Analytics</h1>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-0.5 bg-neutral-100 border border-border rounded text-[11px] font-bold uppercase tracking-wider">
                 <LayoutPanelLeft className="h-3.5 w-3.5 text-foreground" />
                 Operational Intelligence
              </div>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted">
                 Context-aware performance metrics for the <span className="text-foreground font-bold">last 30 days</span>.
              </p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="h-9 px-4 border border-border rounded-md hover:border-foreground transition-all flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-muted hover:text-foreground">
              <Filter className="h-4 w-4" /> Window
           </button>
           <button className="btn-primary h-9 px-4">
              <Download className="h-4 w-4" />
              <span className="ml-2">Report Generation</span>
           </button>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'SLO Compliance Rate', val: '99.94%', trend: '-0.01%', up: false, icon: Target, tag: 'Nominal' },
          { label: 'MTTR Resolution Cycle', val: '24m 12s', trend: '15.2%', up: true, icon: Clock, tag: 'Improving' },
          { label: 'Autonomous Intelligence Rate', val: '82.4%', trend: '22.4%', up: true, icon: BrainCircuit, tag: 'Optimized' },
        ].map(kpi => (
          <div key={kpi.label} className="card-enterprise p-6 group hover:border-foreground transition-all">
            <div className="flex justify-between items-start">
               <div className="h-10 w-10 bg-surface-alt border border-border rounded-xl flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                  <kpi.icon className="h-5 w-5" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-foreground">{kpi.tag}</span>
            </div>
            <div className="space-y-0.5 mt-6">
               <div className="text-[11px] font-bold uppercase tracking-widest text-muted">{kpi.label}</div>
               <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold text-foreground tracking-tighter">{kpi.val}</div>
                  <div className={cn(
                    "flex items-center gap-0.5 text-[11px] font-bold font-mono",
                    kpi.up ? "text-emerald-600" : "text-red-600"
                  )}>
                    {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {kpi.trend}
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* MTTR Trend Chart */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold text-foreground uppercase tracking-widest m-0 flex items-center gap-2">
                 <TrendingUp className="h-4 w-4" /> MTTR Variance Shard
              </h3>
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">P95 Accuracy</span>
           </div>
           <div className="h-[340px] p-6 card-enterprise bg-surface">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends?.mttrTrend || []}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000" stopOpacity={0.05}/>
                      <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--foreground)', fontSize: 10, fontWeight: 900}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--foreground)', fontSize: 10, fontWeight: 900}} 
                  />
                  <Tooltip 
                    cursor={{ stroke: '#000', strokeWidth: 1 }}
                    contentStyle={{ borderRadius: '4px', border: '1px solid #E5E5E5', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold', padding: '8px 12px' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#000" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorArea)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Health Distribution Chart */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold text-foreground uppercase tracking-widest m-0 flex items-center gap-2">
                 <Gauge className="h-4 w-4" /> Fleet Health Integrity
              </h3>
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Logic: Real-Time</span>
           </div>
           <div className="h-[340px] p-6 card-enterprise bg-surface">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends?.serviceHealth || []}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--foreground)', fontSize: 10, fontWeight: 900}} 
                  />
                  <YAxis 
                    domain={[98, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--foreground)', fontSize: 10, fontWeight: 900}} 
                  />
                  <Tooltip 
                     cursor={{fill: '#F9F9F9'}}
                     contentStyle={{ borderRadius: '4px', border: '1px solid #E5E5E5', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={32}>
                    {(trends?.serviceHealth || []).map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={entry.value > 99.9 ? '#000' : '#BBB'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Squad Performance Matrix */}
      <div className="space-y-6 pt-4">
         <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 m-0">
               <Users className="h-5 w-5" /> Resolution Squad Velocity
            </h2>
            <button className="text-[11px] font-bold uppercase tracking-widest text-muted hover:text-foreground">View Operational Board</button>
         </div>
         <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(trends?.teamPerformance || []).map((team: any) => (
               <div key={team.team} className="p-6 card-enterprise bg-surface-alt/20 group hover:border-foreground transition-all">
                  <div className="flex items-start justify-between mb-4">
                     <span className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] group-hover:text-foreground transition-colors">{team.team} Fleet</span>
                     <span className="text-[10px] font-bold text-foreground bg-white border border-border px-1.5 py-0.5 rounded">LAT: {team.avgTime}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-6">
                     <span className="text-3xl font-bold text-foreground tracking-tight">{team.resolved}</span>
                     <span className="text-[12px] font-medium text-muted">Signals Remediated</span>
                  </div>
                  <div className="space-y-1.5">
                     <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted">
                        <span>Success Rate</span>
                        <span>{Math.floor(Math.random() * 5 + 95)}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-surface-alt border border-border rounded-full overflow-hidden">
                        <div className="h-full bg-foreground w-[88%] transition-all duration-1000" />
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
