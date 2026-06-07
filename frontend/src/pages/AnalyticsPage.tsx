import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  Trophy, 
  Target, 
  Users, 
  TrendingUp,
  History,
  Calendar
} from 'lucide-react'

const mttrData = [
  { month: 'Jan', time: 45 },
  { month: 'Feb', time: 38 },
  { month: 'Mar', time: 42 },
  { month: 'Apr', time: 30 },
  { month: 'May', time: 24 },
  { month: 'Jun', time: 18 },
]

const serviceHealth = [
  { name: 'Auth Service', value: 99.98, color: '#3B82F6' },
  { name: 'Payments API', value: 99.95, color: '#8B5CF6' },
  { name: 'Gateway', value: 100.00, color: '#22C55E' },
  { name: 'Search Index', value: 98.42, color: '#F59E0B' },
]

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-outfit">Platform Analytics</h1>
        <p className="text-muted-foreground">Historical performance metrics and team efficiency reporting.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="stat-card border-blue-500">
          <div className="flex items-center gap-3 mb-4 text-blue-500">
            <Target className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">SLA Compliance</span>
          </div>
          <div className="text-4xl font-bold">99.94%</div>
          <div className="text-xs text-muted-foreground mt-2 font-medium">Target: 99.95% (-0.01%)</div>
        </div>
        <div className="stat-card border-purple-500">
          <div className="flex items-center gap-3 mb-4 text-purple-500">
            <History className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Avg. Resolution Time</span>
          </div>
          <div className="text-4xl font-bold">24m 12s</div>
          <div className="text-xs text-emerald-500 mt-2 font-bold font-outfit">↓ 15% from last month</div>
        </div>
        <div className="stat-card border-emerald-500">
          <div className="flex items-center gap-3 mb-4 text-emerald-500">
            <Trophy className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Incidents Prevented</span>
          </div>
          <div className="text-4xl font-bold">142</div>
          <div className="text-xs text-muted-foreground mt-2 font-medium">via AI Anomaly Detection</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* MTTR Trend */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold font-outfit mb-8 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            MTTR Trend (Minutes)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mttrData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Line 
                   type="monotone" 
                   dataKey="time" 
                   stroke="#3B82F6" 
                   strokeWidth={4} 
                   dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                   activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Availability */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold font-outfit mb-8 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Service Availability (Last 30d)
          </h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceHealth}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={10} />
                   <YAxis domain={[95, 100]} axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                   />
                   <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                      {serviceHealth.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-xl font-bold font-outfit flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" />
            Team Velocity
          </h3>
          <button className="text-sm font-bold text-primary hover:underline">Download CSV Repot</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           {[
             { team: "Platform Ops", resolved: 42, avgTime: "12m" },
             { team: "API Engineering", resolved: 28, avgTime: "45m" },
             { team: "Frontend Crew", resolved: 15, avgTime: "18m" },
             { team: "Security Core", resolved: 31, avgTime: "24m" }
           ].map(team => (
             <div key={team.team} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-xs font-bold text-muted-foreground uppercase mb-2">{team.team}</div>
                <div className="flex items-end justify-between">
                   <div className="text-2xl font-bold">{team.resolved}</div>
                   <div className="text-sm text-emerald-500 font-bold">{team.avgTime} avg</div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
