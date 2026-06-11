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
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-bold font-outfit tracking-tight">Platform Overview</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">Real-time operational health and incident intelligence.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex w-full sm:w-auto gap-1 p-1 bg-accent/20 border border-border rounded-lg justify-center sm:justify-start">
             {[
               { icon: Activity, type: "cpu_spike", title: "CPU Spike" },
               { icon: AlertCircle, type: "database_crash", title: "DB Crash" },
               { icon: Zap, type: "api_latency", title: "Latency" }
             ].map(sim => (
               <button 
                 key={sim.type}
                 onClick={async () => {
                   await apiClient.triggerSimulation(sim.type);
                   toast.success(`Simulation: ${sim.title} injected.`);
                 }}
                 className="p-2 hover:bg-primary/20 hover:text-primary rounded-md text-muted-foreground transition-all flex-1 sm:flex-none justify-center"
                 title={`Simulate ${sim.title}`}
               >
                 <sim.icon className="h-4 w-4" />
               </button>
             ))}
             <span className="w-px bg-border mx-1 hidden sm:block" />
             <div className="px-2 py-1 text-[9px] font-bold text-muted-foreground uppercase flex items-center hidden sm:flex">Lab</div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="btn-secondary h-10 text-xs flex-1 sm:flex-none justify-center">Board</button>
            <button className="btn-primary h-10 text-xs flex-1 sm:flex-none justify-center shadow-lg shadow-primary/20">Track Incident</button>
          </div>
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
           <button className="text-xs text-primary font-bold hover:underline">Analysis Report</button>
        </div>
        <div className="p-6 overflow-x-auto">
           <table className="w-full text-left min-w-[600px]">
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
                {(stats?.riskProfiles || [
                  { id: 1, type: 'Notice', context: 'Baseline stability - Analyzing patterns', conf: '98%', status: 'STABLE' },
                  { id: 2, type: 'Warning', context: 'Memory pressure detected in US-EAST-1B', conf: '84%', status: 'MONITORING' }
                ]).map((item: any, idx: number) => (
                  <tr key={item.id || idx} className="text-sm hover:bg-accent/10 transition-colors">
                    <td className="py-4">
                       <span className={cn(
                         "status-badge",
                         item.type === 'Critical' ? "badge-critical" : 
                         item.type === 'Warning' ? "badge-warning" : "badge-info"
                       )}>{item.type}</span>
                    </td>
                    <td className="py-4 font-mono text-xs">{item.context}</td>
                    <td className="py-4 font-bold">{item.conf}</td>
                    <td className="py-4 font-bold text-[10px] text-muted-foreground">{item.status}</td>
                    <td className="py-4 text-right">
                       <button className="text-primary hover:text-blue-400 transition-all p-1 hover:bg-primary/10 rounded">
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
