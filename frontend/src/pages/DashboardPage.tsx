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
  Zap
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { cn } from '@/utils/cn'

const performanceData = [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 52 },
  { time: '08:00', value: 38 },
  { time: '12:00', value: 65 },
  { time: '16:00', value: 48 },
  { time: '20:00', value: 58 },
  { time: '23:59', value: 42 },
]

const incidentData = [
  { name: 'S1', count: 4, color: '#EF4444' },
  { name: 'S2', count: 12, color: '#F59E0B' },
  { name: 'S3', count: 24, color: '#3B82F6' },
  { name: 'S4', count: 18, color: '#22C55E' },
]

const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  const stats = [
    { 
      label: 'System Uptime', 
      value: '99.98%', 
      change: '+0.02%', 
      trend: 'up',
      icon: Zap,
      color: 'text-blue-500',
      border: 'border-blue-500'
    },
    { 
      label: 'Active Incidents', 
      value: '14', 
      change: '-2', 
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-orange-500',
      border: 'border-orange-500'
    },
    { 
      label: 'MTTR', 
      value: '24m', 
      change: '-5m', 
      trend: 'down',
      icon: Activity,
      color: 'text-purple-500',
      border: 'border-purple-500'
    },
    { 
      label: 'SLA Status', 
      value: 'Healthy', 
      change: '100%', 
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      border: 'border-emerald-500'
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold font-outfit tracking-tight">Executive Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="text-foreground font-semibold">{user?.firstName}</span>. Here is your platform health report.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors">
            Export Report
          </button>
          <button className="btn-primary py-2 text-sm">
            Live Monitoring
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={cn("stat-card", stat.border)}>
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg bg-current/10", stat.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full",
                  stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-muted-foreground text-sm font-medium uppercase tracking-wider">{stat.label}</div>
              <div className="text-3xl font-bold mt-1 tabular-nums">{stat.value}</div>
            </div>
          )
        })}
      </div>

      {/* Main Insights Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Traffic Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold font-outfit">System Performance</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-muted-foreground outline-none">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold font-outfit mb-8">Incident Severity</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#F8FAFC', fontWeight: 'bold' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {incidentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
             <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Highest Priority (S1)</span>
                <span className="font-bold text-red-500">4 Critical</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[20%]" />
             </div>
          </div>
        </div>
      </div>

      {/* AI Insights Board */}
      <div className="glass-card p-8 border-t-4 border-purple-500">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold font-outfit">AI Root Cause Analysis</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Network Latency Spike",
              desc: "Detected 200ms increase in p99 latency across us-east-1.",
              action: "Investigate AWS peering",
              risk: "High"
            },
            {
              title: "Memory Leak Detected",
              desc: "Service 'auth-backend' pod memory increasing 10%/hr.",
              action: "Review PR #4521",
              risk: "Medium"
            },
            {
              title: "Unusual Login Patterns",
              desc: "High fail rate from unique IPs in the last 15 minutes.",
              action: "Auto-blocking IPs",
              risk: "Active"
            }
          ].map((insight) => (
            <div key={insight.title} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
              <div className="text-xs font-bold text-purple-400 mb-2">{insight.risk} Risk</div>
              <h4 className="font-bold group-hover:text-primary transition-colors">{insight.title}</h4>
              <p className="text-sm text-muted-foreground mt-2">{insight.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-foreground/80">
                Action: <span className="text-primary underline">{insight.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
