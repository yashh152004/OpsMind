import React from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area
} from 'recharts'
import { 
  Target, Users, TrendingUp, Download, LayoutPanelLeft, Clock,
  ArrowUpRight, ArrowDownRight, BrainCircuit, RefreshCcw
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { cn } from '@/utils/cn'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border-strong p-3 rounded-[var(--radius)] shadow-lg text-left">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{label}</p>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
          <span className="text-[13px] font-semibold text-foreground">
             Metric: {payload[0].value}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

const AnalyticsPage: React.FC = () => {
  const { data: trends, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['analytics-trends'],
    queryFn: () => apiClient.getAnalyticsTrends(),
    refetchInterval: 60000
  })

  return (
    <div className="page-transition-fade space-y-6 p-6 lg:p-8 bg-background min-h-screen">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-border">
        <div className="space-y-1 text-left">
           <h1 className="text-[32px] font-bold tracking-tight text-foreground m-0 leading-tight">Performance Analytics</h1>
           <div className="flex items-center gap-2.5">
              <span className="badge-enterprise bg-surface-alt border border-border py-0.5">
                 <LayoutPanelLeft className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                 Operational Intelligence
              </span>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted-foreground">
                 Context-aware performance metrics for the <span className="text-foreground font-semibold">last 30 days</span>.
              </p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => refetch()} className="btn-secondary h-8.5 px-3">
              <RefreshCcw className={cn("h-3.5 w-3.5 mr-1.5", isRefetching && "animate-spin")} />
              <span>Sync Metrics</span>
           </button>
           <button className="btn-primary h-8.5 px-3">
              <Download className="h-4 w-4" />
              <span>Generate Report</span>
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
          <div key={kpi.label} className="card-enterprise p-5 group transition-all text-left">
            <div className="flex justify-between items-start">
               <div className="p-1.5 bg-surface-alt border border-border rounded-md text-muted-foreground transition-all group-hover:bg-foreground group-hover:text-background group-hover:border-foreground">
                  <kpi.icon className="h-4.5 w-4.5 text-muted-foreground group-hover:text-current" />
               </div>
               <span className="badge-enterprise bg-surface-alt text-muted-foreground">{kpi.tag}</span>
            </div>
            <div className="space-y-0.5 mt-4">
               <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</div>
               <div className="flex items-baseline gap-1.5">
                  <div className="text-[22px] font-bold text-foreground tracking-tight">{kpi.val}</div>
                  <div className={cn(
                    "flex items-center gap-0.5 text-[11px] font-semibold font-mono",
                    kpi.up ? "text-emerald-500" : "text-red-500"
                  )}>
                    {kpi.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {kpi.trend}
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* MTTR Trend Chart */}
        <div className="space-y-3">
           <div className="flex items-center justify-between text-left">
              <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wider m-0 flex items-center gap-1.5">
                 <TrendingUp className="h-4 w-4 text-muted-foreground" /> MTTR Variance Shard
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">P95 Accuracy</span>
           </div>
           <div className="h-[300px] p-4 card-enterprise bg-surface">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends?.mttrTrend || []}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="currentColor" className="text-foreground" stopOpacity={0.06}/>
                       <stop offset="95%" stopColor="currentColor" className="text-foreground" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'currentColor', fontSize: 10, fontWeight: 500}} 
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'currentColor', fontSize: 10, fontWeight: 500}} 
                    className="text-muted-foreground"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="time" 
                    stroke="currentColor" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#colorArea)" 
                    className="text-foreground"
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Health Distribution Chart */}
        <div className="space-y-3">
           <div className="flex items-center justify-between text-left">
              <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wider m-0 flex items-center gap-1.5">
                 <Target className="h-4 w-4 text-muted-foreground" /> Fleet Health Integrity
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Logic: Real-Time</span>
           </div>
           <div className="h-[300px] p-4 card-enterprise bg-surface">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends?.serviceHealth || []}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-border/40" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'currentColor', fontSize: 10, fontWeight: 500}} 
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    domain={[98, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'currentColor', fontSize: 10, fontWeight: 500}} 
                    className="text-muted-foreground"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={24}>
                    {(trends?.serviceHealth || []).map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill="currentColor" className={entry.value > 99.9 ? 'text-foreground' : 'text-muted-foreground/40'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Squad Performance Matrix */}
      <div className="space-y-4 pt-2">
         <div className="flex items-center justify-between border-b border-border pb-2.5 text-left">
            <h2 className="text-[16px] font-semibold tracking-tight text-foreground flex items-center gap-1.5 m-0">
               <Users className="h-5 w-5 text-muted-foreground" /> Resolution Squad Velocity
            </h2>
            <button className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">View Operational Board</button>
         </div>
         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(trends?.teamPerformance || []).map((team: any) => (
               <div key={team.team} className="p-5 card-enterprise bg-surface-alt/40 group transition-all text-left">
                  <div className="flex items-start justify-between mb-4">
                     <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{team.team} Shard</span>
                     <span className="badge-enterprise bg-secondary text-foreground">LAT: {team.avgTime}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-5">
                     <span className="text-[22px] font-bold text-foreground tracking-tight leading-none">{team.resolved}</span>
                     <span className="text-[12px] font-medium text-muted-foreground">Signals Resolved</span>
                  </div>
                  <div className="space-y-1.5">
                     <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <span>Success Rate</span>
                        <span>{Math.floor(Math.random() * 5 + 95)}%</span>
                     </div>
                     <div className="h-[5px] w-full bg-secondary rounded-full overflow-hidden border border-border/80">
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
