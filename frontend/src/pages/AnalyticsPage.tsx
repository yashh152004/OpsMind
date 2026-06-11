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
  Trophy, 
  Target, 
  Users, 
  TrendingUp,
  History,
  Calendar,
  Download
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'

const AnalyticsPage: React.FC = () => {
  const { data: trends, isLoading } = useQuery({
    queryKey: ['analytics-trends'],
    queryFn: () => apiClient.getAnalyticsTrends()
  })

  return (
    <div className="space-y-8 pb-12 page-transition">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold font-outfit">Performance Reporting</h1>
          <p className="text-muted-foreground text-sm font-medium">Historical efficacy and SLA fulfillment metrics.</p>
        </div>
        <button className="btn-secondary h-10 w-full md:w-auto text-xs flex justify-center bg-card shadow-sm border-border active:scale-95 transition-transform">
           <Download className="h-4 w-4 mr-1.5" />
           Generate PDF Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="enterprise-card p-6 border-l-4 border-l-blue-500 hover:bg-blue-500/[0.02] transition-colors">
          <div className="flex items-center gap-3 mb-4 text-blue-500">
            <Target className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compliance SLA</span>
          </div>
          <div className="text-3xl font-bold font-mono">99.94%</div>
          <div className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tighter">Objective: 99.95% | Delta: -0.01%</div>
        </div>
        <div className="enterprise-card p-6 border-l-4 border-l-purple-500 hover:bg-purple-500/[0.02] transition-colors">
          <div className="flex items-center gap-3 mb-4 text-purple-500">
            <History className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Avg. MTTR Time</span>
          </div>
          <div className="text-3xl font-bold font-mono">24m 12s</div>
          <div className="text-[10px] text-emerald-500 mt-2 font-bold uppercase tracking-tighter">↓ 15.2% Efficiency gain</div>
        </div>
        <div className="enterprise-card p-6 border-l-4 border-l-emerald-500 sm:col-span-2 lg:col-span-1 hover:bg-emerald-500/[0.02] transition-colors">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <Trophy className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Incident Avoidance</span>
          </div>
          <div className="text-3xl font-bold font-mono">142</div>
          <div className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tighter">Signals mitigated via AI agent</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* MTTR Trend */}
        <div className="enterprise-card p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            MTTR Volatility (Minutes)
          </h3>
          <div className="h-[280px]">
             {isLoading ? <div className="h-full w-full skeleton" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends?.mttrTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#2563EB" 
                    strokeWidth={3} 
                    dot={{ fill: '#2563EB', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
             )}
          </div>
        </div>

        {/* Service Availability */}
        <div className="enterprise-card p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-500" />
            Infrastructure Availability
          </h3>
          <div className="h-[280px]">
             {isLoading ? <div className="h-full w-full skeleton" /> : (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends?.serviceHealth || []}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1F2937" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
                    <YAxis domain={[95, 100]} axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px' }}
                    />
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

      {/* Team Velocity Table */}
      <div className="enterprise-card overflow-hidden">
        <div className="p-4 bg-accent/20 border-b border-border flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Users className="h-3.5 w-3.5" /> Engineer Throughput
            </h3>
        </div>
        <div className="p-6">
           <div className="grid gap-4 md:grid-cols-3">
              {(trends?.teamPerformance || []).map((team: any) => (
                <div key={team.team} className="p-4 rounded border border-border bg-background hover:border-primary/50 transition-colors">
                   <div className="text-[10px] font-bold text-muted-foreground uppercase mb-3">{team.team}</div>
                   <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold font-mono">{team.resolved}</div>
                      <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Resolved | {team.avgTime} Avg</div>
                   </div>
                   <div className="mt-3 h-1 w-full bg-accent/30 rounded-full">
                      <div className="h-full bg-primary w-[70%]" />
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
