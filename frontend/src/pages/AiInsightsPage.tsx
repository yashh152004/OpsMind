import React, { useMemo } from 'react'
import {
   Sparkles, BrainCircuit, Zap, ShieldAlert, ArrowRight, RefreshCcw,
   CheckCircle2, Terminal, Info, BarChart3, Activity, Command,
   Cpu, Hash, ShieldCheck, Layers, Gauge, TrendingUp, AlertCircle,
   Clock, Server, Shield, Share2, MoreVertical, Maximize2, Download
} from 'lucide-react'
import {
   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   BarChart, Bar, Cell, LineChart, Line, Legend
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'
import { format } from 'date-fns'

const AiInsightsPage: React.FC = () => {
   const { data: insightsData, isLoading, refetch, isRefetching } = useQuery({
      queryKey: ['ai-insights'],
      queryFn: () => apiClient.getAiInsights(),
      refetchInterval: 60000
   })

   // Simulated Series Data for Visualizations
   const seriesData = useMemo(() => {
      const data = [];
      for (let i = 0; i < 24; i++) {
         data.push({
            time: `${i}:00`,
            prediction: 20 + Math.random() * 40,
            anomaly: 10 + Math.random() * 20,
            alertDensity: Math.random() * 5,
            risk: 5 + Math.random() * 10
         });
      }
      return data;
   }, []);

   const handleRemediate = async (insight: any) => {
      const toastId = toast.loading(`MISSION_PATCH_INIT: Initializing stabilization for ${insight.id || 'shard-01'}...`, {
         className: 'font-mono font-bold text-[12px] uppercase tracking-widest'
      })

      try {
         await new Promise(resolve => setTimeout(resolve, 800))
         toast.loading(`[NODE_LOGIC] Patching ingress logic in autonomous-shard...`, { id: toastId })
         await new Promise(resolve => setTimeout(resolve, 1200))
         toast.success(`MISSION_SUCCESS: Shard stabilized. Remediation logic enforced.`, {
            id: toastId,
            className: 'font-mono font-bold text-[12px] uppercase tracking-widest'
         })
         refetch()
      } catch (e) {
         toast.error(`MISSION_FAULT: Remediation logic failed.`, { id: toastId })
      }
   }

   if (isLoading) {
      return (
         <div className="p-8 space-y-10 animate-pulse bg-background min-h-screen">
            <div className="h-20 w-full skeleton-ui" />
            <div className="grid grid-cols-4 gap-6">
               {Array(4).fill(0).map((_, i) => <div key={i} className="h-32 skeleton-ui" />)}
            </div>
            <div className="grid grid-cols-2 gap-8">
               <div className="h-96 skeleton-ui" />
               <div className="h-96 skeleton-ui" />
            </div>
         </div>
      );
   }

   return (
      <div className="page-transition-fade space-y-10 p-8 lg:p-10 bg-background min-h-screen max-w-[1700px] mx-auto">
         {/* Reasoning Header */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b-2 border-foreground/5">
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-black text-white rounded-lg flex items-center justify-center shadow-xl">
                     <BrainCircuit className="h-6 w-6" />
                  </div>
                  <h1 className="text-[42px] font-bold tracking-tight text-foreground m-0 uppercase leading-none">Predictive Architecture</h1>
               </div>
               <div className="flex items-center gap-4">
                  <p className="text-[12px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                     Engine: Core_Reasoning_v4.2 • Deterministic Ingress
                  </p>
                  <div className="h-4 w-[1px] bg-border" />
                  <div className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Real-time Policy Enforced</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="btn-secondary h-11 border-strong"
               >
                  <RefreshCcw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
                  <span className="ml-2 uppercase tracking-widest text-[11px] font-bold">Sync Signals</span>
               </button>
               <button className="btn-primary h-11 shadow-2xl shadow-black/20">
                  <Zap className="h-4 w-4" />
                  <span className="ml-2 uppercase tracking-widest text-[11px] font-bold">Enforce All Patches</span>
               </button>
            </div>
         </div>

         {/* Top Layer: KPI Shards */}
         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
               { label: 'Platform Health Score', val: '98.2', trend: '+1.4%', icon: Gauge, desc: 'Composite integrity metric' },
               { label: 'Prediction Confidence', val: '94.5%', trend: 'STABLE', icon: ShieldCheck, desc: 'Model verification rate' },
               { label: 'Incident Forecast (24h)', val: '12-14', trend: '-22%', icon: TrendingUp, desc: 'Probabilistic signal count' },
               { label: 'Global Risk Index', val: 'LOW', trend: 'NONE', icon: ShieldAlert, desc: 'Cross-region security state' },
            ].map(kpi => (
               <div key={kpi.label} className="card-enterprise p-6 group hover:bg-surface-hover/30 transition-all border-border-strong">
                  <div className="flex justify-between items-start mb-6">
                     <div className="h-10 w-10 bg-surface-alt border border-border-strong rounded flex items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-background">
                        <kpi.icon className="h-5 w-5" />
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{kpi.trend}</span>
                  </div>
                  <div className="space-y-1">
                     <div className="text-[11px] font-bold text-muted uppercase tracking-widest">{kpi.label}</div>
                     <div className="text-3xl font-black text-foreground tracking-tighter">{kpi.val}</div>
                     <div className="text-[10px] font-medium text-muted-foreground uppercase mt-2">{kpi.desc}</div>
                  </div>
               </div>
            ))}
         </div>

         {/* Middle Layer: Predictive Visualizations */}
         <div className="grid gap-8 lg:grid-cols-2">
            <ChartContainer title="Failure Prediction Shard" subtitle="7-day probabilistic drift analysis">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={seriesData}>
                     <defs>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                           <stop offset="95%" stopColor="#000" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEE" />
                     <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#111', fontSize: 10, fontWeight: 700 }}
                        interval={3}
                     />
                     <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#111', fontSize: 10, fontWeight: 700 }}
                     />
                     <Tooltip
                        contentStyle={{ borderRadius: '4px', border: '2px solid #000', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                     />
                     <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                     <Area type="monotone" dataKey="prediction" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" name="PROBABILITY" />
                     <Area type="monotone" dataKey="risk" stroke="#999" strokeWidth={2} strokeDasharray="5 5" fill="none" name="VARIANCE" />
                  </AreaChart>
               </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Anomaly Frequency Trend" subtitle="Cluster-wide signal deviations">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seriesData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEE" />
                     <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#111', fontSize: 10, fontWeight: 700 }}
                        interval={3}
                     />
                     <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#111', fontSize: 10, fontWeight: 700 }}
                     />
                     <Tooltip
                        contentStyle={{ borderRadius: '4px', border: '2px solid #000', fontSize: '12px', fontWeight: 'bold' }}
                     />
                     <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                     <Bar dataKey="anomaly" fill="#000" radius={[2, 2, 0, 0]} name="SIGNALS" />
                     <Bar dataKey="alertDensity" fill="#CCC" radius={[2, 2, 0, 0]} name="ALERTS" />
                  </BarChart>
               </ResponsiveContainer>
            </ChartContainer>
         </div>

         {/* Bottom Layer: Insights & Recommendations */}
         <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-[20px] font-bold text-foreground flex items-center gap-2 m-0 uppercase tracking-tight">
                     <Sparkles className="h-5 w-5 text-black" /> Recommendation Intelligence
                  </h3>
                  <span className="text-[11px] font-bold text-muted uppercase tracking-widest">Global Policy Shards</span>
               </div>

               <div className="grid gap-4">
                  {(!insightsData || insightsData.length === 0) ? (
                     <div className="card-enterprise p-20 text-center space-y-4 border-strong border-dashed">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto opacity-30" />
                        <p className="text-[14px] font-bold text-muted uppercase tracking-widest">Zero high-risk deviations detected.</p>
                     </div>
                  ) : (
                     insightsData.map((insight: any, idx: number) => (
                        <div key={idx} className="card-enterprise group hover:border-black transition-all">
                           <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                              <div className="p-6 md:w-48 bg-surface-alt/40 flex flex-col items-center justify-center gap-3">
                                 <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center text-white shadow-lg",
                                    insight.type === 'Critical' ? "bg-red-600" : "bg-black"
                                 )}>
                                    <AlertCircle className="h-5 w-5" />
                                 </div>
                                 <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    insight.type === 'Critical' ? "text-red-700" : "text-black"
                                 )}>{insight.type} Signal</span>
                              </div>
                              <div className="flex-1 p-8 space-y-4">
                                 <div className="flex items-center justify-between">
                                    <h5 className="text-[18px] font-black tracking-tight text-foreground m-0">{insight.title}</h5>
                                    <span className="text-[11px] font-bold text-muted uppercase tracking-widest">{insight.status || 'Confidence High'}</span>
                                 </div>
                                 <p className="text-[14px] font-medium text-secondary leading-relaxed italic border-l-4 border-foreground/10 pl-4 py-1">
                                    "{insight.desc}"
                                 </p>
                                 <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="text-[12px] font-bold text-foreground bg-surface-alt px-3 py-1.5 rounded border border-border-strong flex items-center gap-2">
                                       <TrendingUp className="h-3.5 w-3.5" /> MTTR Impact: -18% predicted
                                    </div>
                                    <button
                                       onClick={() => handleRemediate(insight)}
                                       className="text-[11px] font-black text-white bg-black px-4 py-1.5 rounded hover:opacity-90 flex items-center gap-2 ml-auto"
                                    >
                                       Enforce Remediation <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-[20px] font-bold text-foreground flex items-center gap-2 m-0 uppercase tracking-tight">
                     Services At Risk
                  </h3>
                  <button className="text-[11px] font-bold text-muted uppercase tracking-widest hover:text-black">Audit</button>
               </div>

               <div className="space-y-3">
                  {[
                     { name: 'auth-ingress-v2', risk: 'Elevated', trend: 'UP', code: '0xFA1' },
                     { name: 'payment-shard-08', risk: 'Medium', trend: 'STABLE', code: '0xB21' },
                     { name: 'telemetry-sink', risk: 'Low', trend: 'DOWN', code: '0x889' },
                     { name: 'security-mesh', risk: 'Minimal', trend: 'DOWN', code: '0xC04' },
                  ].map(service => (
                     <div key={service.name} className="p-4 card-enterprise flex items-center justify-between group hover:border-black transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-surface-alt border border-border rounded flex items-center justify-center text-foreground font-mono text-[10px] font-bold">
                              {service.code}
                           </div>
                           <div className="space-y-0.5">
                              <div className="text-[14px] font-black text-foreground">{service.name}</div>
                              <div className="text-[10px] font-bold text-muted uppercase tracking-widest">Signal: {service.trend}</div>
                           </div>
                        </div>
                        <div className={cn(
                           "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border",
                           service.risk === 'Elevated' ? "bg-red-50 text-red-700 border-red-200" :
                              service.risk === 'Medium' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-surface-alt text-muted border-border"
                        )}>
                           {service.risk}
                        </div>
                     </div>
                  ))}
               </div>

               <div className="card-enterprise p-6 bg-black text-white relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                     <div className="flex items-center gap-2 text-emerald-400">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-[12px] font-bold uppercase tracking-widest">Autonomous Guard</span>
                     </div>
                     <h4 className="text-[20px] font-black tracking-tight m-0 text-white leading-tight">Shielding Policy Active</h4>
                     <p className="text-[13px] text-white/50 leading-relaxed">
                        Intelligence Engine has full authorization to deploy L1 shards. 18 anomalies mitigated automatically today.
                     </p>
                     <button className="w-full h-10 bg-white text-black font-bold text-[11px] uppercase tracking-widest hover:opacity-90">Review Logs</button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

const ChartContainer = ({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) => (
   <div className="card-enterprise flex flex-col h-[500px] border-border-strong">
      <div className="px-8 py-6 border-b border-border flex items-center justify-between">
         <div className="space-y-1">
            <h3 className="text-[18px] font-black text-foreground mb-0 uppercase tracking-tight leading-none">{title}</h3>
            <p className="text-[11px] text-muted font-bold mb-0 uppercase tracking-[0.2em]">{subtitle}</p>
         </div>
         <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-surface-alt rounded border border-border-strong text-muted hover:text-foreground transition-all"><Maximize2 className="h-4 w-4" /></button>
            <button className="p-2 hover:bg-surface-alt rounded border border-border-strong text-muted hover:text-foreground transition-all"><Download className="h-4 w-4" /></button>
         </div>
      </div>
      <div className="p-8 flex-1 w-full min-h-0">
         {children}
      </div>
   </div>
);

export default AiInsightsPage;
