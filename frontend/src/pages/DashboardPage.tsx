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
  CheckCircle2, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { cn } from '@/utils/cn'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
    refetchInterval: 30000 // Refetch every 30s for 'Live' feel
  })

  // Professional KPI configuration
  const kpis = [
    { 
      label: 'System Uptime', 
      value: stats?.uptime || '---', 
      change: '+0.02%', 
      trend: 'up',
      icon: Zap,
      color: 'text-blue-500'
    },
    { 
      label: 'Active Incidents', 
      value: stats?.activeIncidents || '0', 
      change: '-12%', 
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-orange-500'
    },
    { 
      label: 'Mean Time to Resolve', 
      value: stats?.mttr || '---', 
      change: '-5m', 
      trend: 'down',
      icon: Activity,
      color: 'text-emerald-500'
    },
    { 
      label: 'SLA Compliance', 
      value: stats?.slaStatus || '---', 
      change: '100%', 
      trend: 'up',
      icon: ShieldCheck,
      color: 'text-primary'
    },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Platform Overview</h1>
          <p className="text-muted-foreground text-sm">Real-time operational health and incident intelligence.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-4">
             {[1,2,3].map(i => (
               <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-accent flex items-center justify-center text-[10px] font-bold">
                 {String.fromCharCode(64+i)}
               </div>
             ))}
             <div className="h-8 w-12 rounded-full border-2 border-background bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
               +12
             </div>
          </div>
          <button className="btn-secondary h-9 text-xs">Configure Board</button>
          <button className="btn-primary h-9 text-xs">Track Incident</button>
        </div>
      </div>

      {/* KPI Stream */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="enterprise-card p-5 group enterprise-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded bg-background border border-border", kpi.color)}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded",
                kpi.trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
              )}>
                {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.change}
              </div>
            </div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</div>
            <div className="text-2xl font-bold mt-1 font-mono tracking-tight">
              {isLoading ? <div className="h-8 w-24 skeleton" /> : kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Network performance */}
        <div className="enterprise-card p-6 lg:col-span-2">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Service Latency (ms)</h3>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Success
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-destructive" /> Failed
                </span>
              </div>
           </div>
           <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.performanceSeries || []}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 11 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 11 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="enterprise-card p-6">
          <h3 className="text-lg font-bold mb-8">Alert Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.severityDistribution || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1F2937" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#F8FAFC', fontWeight: 'bold', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {(stats?.severityDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'P1' ? '#EF4444' : entry.name === 'P2' ? '#F59E0B' : '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-4">
             <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Critical Issues Unresolved</span>
                <span className="font-bold text-destructive">4 Active</span>
             </div>
             <div className="h-2 w-full bg-accent/20 rounded-full overflow-hidden">
                <div className="h-full bg-destructive w-[20%]" />
             </div>
          </div>
        </div>
      </div>

      {/* AI Risk Engine Board */}
      <div className="enterprise-card overflow-hidden">
        <div className="p-4 bg-accent/20 border-b border-border flex items-center justify-between">
           <div className="flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4 fill-primary" />
              <span className="text-sm font-bold uppercase tracking-widest text-[#2563EB]">AI Risk Detection System</span>
           </div>
           <button className="text-xs text-primary font-bold hover:underline">Full Log Report</button>
        </div>
        <div className="p-6">
           <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  <th className="pb-4">Risk Profile</th>
                  <th className="pb-4">Infrastructure Context</th>
                  <th className="pb-4">Confidence</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { id: 1, type: 'Critical', context: 'Memory Leak - auth-api pod', conf: '92%', status: 'PREDICTED' },
                  { id: 2, type: 'Warning', context: 'Spike in Database IOPS', conf: '84%', status: 'ANALYZING' },
                  { id: 3, type: 'Notice', context: 'High cache miss rate', conf: '76%', status: 'IGNORED' }
                ].map(item => (
                  <tr key={item.id} className="text-sm hover:bg-accent/10">
                    <td className="py-4">
                       <span className={cn(
                         "status-badge",
                         item.type === 'Critical' ? "badge-critical" : "badge-warning"
                       )}>{item.type}</span>
                    </td>
                    <td className="py-4 font-mono text-xs">{item.context}</td>
                    <td className="py-4 font-bold">{item.conf}</td>
                    <td className="py-4 font-bold text-[10px] text-muted-foreground">{item.status}</td>
                    <td className="py-4 text-right">
                       <button className="text-primary hover:text-blue-400 transition-colors">
                         <ExternalLink className="h-4 w-4" />
                       </button>
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
