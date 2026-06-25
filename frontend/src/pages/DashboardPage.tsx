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
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShieldCheck,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

const DashboardPage: React.FC = () => {
  
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
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Systems Overview</h1>
          <p className="text-slate-500 text-sm font-medium mt-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            Operational Intelligence Surface • Real-time telemetry active
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
             {[
               { icon: Activity, type: "cpu_spike", title: "CPU" },
               { icon: AlertCircle, type: "database_crash", title: "DB" },
               { icon: Zap, type: "api_latency", title: "LAT" }
             ].map(sim => (
               <button 
                 key={sim.type}
                 onClick={async () => {
                   await apiClient.triggerSimulation(sim.type);
                   toast.success(`Simulation Injected: ${sim.title}`);
                 }}
                 className="p-2.5 hover:bg-white hover:text-blue-600 rounded-md text-slate-500 transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-tighter"
                 title={`Simulate ${sim.title}`}
               >
                 <sim.icon className="h-3.5 w-3.5" />
                 {sim.title}
               </button>
             ))}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="px-4 py-2 bg-white border border-slate-200 text-[#0F172A] font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors">Incident Board</button>
            <button className="px-4 py-2 bg-[#2563EB] text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-shadow shadow-md shadow-blue-600/20">Track New Incident</button>
          </div>
        </div>
      </div>

      {/* KPI Stream */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:border-blue-300 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg bg-slate-50 border border-slate-100", kpi.color)}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border",
                kpi.trend === 'up' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
              )}>
                {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.change}
              </div>
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{kpi.label}</div>
            <div className="text-2xl font-black mt-1 text-[#0F172A] font-mono tracking-tighter">
              {isLoading ? <div className="h-8 w-24 skeleton" /> : kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Network performance */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm lg:col-span-2">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">Core Telemetry Stream</h3>
                <p className="text-xs text-slate-500 font-medium">Latency gradients across global edge nodes</p>
              </div>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="h-2 w-2 rounded-full bg-[#2563EB]" /> Nominal
                </span>
                <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Outlier
                </span>
              </div>
           </div>
           <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.performanceSeries || []}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0F172A', fontWeight: 700 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
          <div className="mb-10">
            <h3 className="text-lg font-bold text-[#0F172A]">Event Distribution</h3>
            <p className="text-xs text-slate-500 font-medium">Alert density by systemic impact</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.severityDistribution || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#0F172A', fontWeight: 800, fontSize: 11 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                  {(stats?.severityDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'P1' ? '#EF4444' : entry.name === 'P2' ? '#F59E0B' : '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-5">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Critical Backlog</span>
                <span className="text-xs font-black text-red-600">4 Active</span>
             </div>
             <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-red-500 w-[25%]" />
             </div>
             <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                System stress analysis suggests potential cascading failure in North-Europe shard.
             </p>
          </div>
        </div>
      </div>

      {/* AI Risk Engine Board */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-blue-600">
        <div className="p-5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">AI Contextual Risk Engine</span>
                <p className="text-[10px] text-slate-400 font-bold">MODE: SRE_AUTONOMOUS_ANALYSIS_V3</p>
              </div>
           </div>
           <button className="px-3 py-1.5 bg-white border border-slate-200 text-blue-600 font-bold text-[10px] rounded-lg hover:bg-slate-50 transition-all uppercase tracking-tighter shadow-sm">Audit Logic</button>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50/30">
                <tr className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] border-b border-slate-200/50">
                  <th className="px-8 py-5">System Risk Profile</th>
                  <th className="px-8 py-5">Autonomous Reasoning Context</th>
                  <th className="px-8 py-5">Confidence</th>
                  <th className="px-8 py-5">Logic State</th>
                  <th className="px-8 py-5 text-right">Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats?.riskProfiles || [
                  { id: 1, type: 'Nominal', context: 'Baseline stability - All global clusters reporting nominal latency gradients.', conf: '99.2%', status: 'STABLE' },
                  { id: 2, type: 'Warning', context: 'Anomalous memory pressure detected in US-EAST-1B shard. Potential OOM signal.', conf: '86.4%', status: 'REASONING' },
                  { id: 3, type: 'Critical', context: 'Failed health probes for Auth-Service-02. Cascading latency detected.', conf: '92.1%', status: 'FAILED' }
                ]).map((item: any, idx: number) => (
                  <tr key={item.id || idx} className="text-sm hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                       <span className={cn(
                         "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                         item.type === 'Critical' ? "bg-red-50 text-red-600 border-red-100" : 
                         item.type === 'Warning' ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
                       )}>{item.type}</span>
                    </td>
                    <td className="px-8 py-5 font-medium text-[#0F172A] max-w-md truncate">{item.context}</td>
                    <td className="px-8 py-5 font-black text-slate-600">{item.conf}</td>
                    <td className="px-8 py-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">{item.status}</td>
                    <td className="px-8 py-5 text-right">
                       <button className="text-slate-300 hover:text-blue-600 transition-all p-2 hover:bg-blue-50 rounded-lg">
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
