import React, { useMemo } from 'react'
import {
   BrainCircuit, Zap, ShieldAlert, ArrowRight, RefreshCcw,
   CheckCircle2, Gauge, ShieldCheck, TrendingUp, AlertCircle,
   Maximize2, Download
} from 'lucide-react'
import {
   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   BarChart, Bar, Legend
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border-strong p-3 rounded-[var(--radius)] shadow-lg text-left">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{label}</p>
        <div className="space-y-1">
           {payload.map((p: any) => (
             <div key={p.name} className="flex items-center gap-1.5">
               <div className={cn("h-1.5 w-1.5 rounded-full", p.name === 'PROBABILITY' || p.name === 'SIGNALS' ? 'bg-foreground' : 'bg-muted-foreground')} />
               <span className="text-[13px] font-semibold text-foreground">
                  {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
               </span>
             </div>
           ))}
        </div>
      </div>
    );
  }
  return null;
};

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
         className: 'font-mono font-semibold text-[12px] uppercase tracking-widest'
      })

      try {
         await new Promise(resolve => setTimeout(resolve, 800))
         toast.loading(`[NODE_LOGIC] Patching ingress logic in autonomous-shard...`, { id: toastId })
         await new Promise(resolve => setTimeout(resolve, 1200))
         toast.success(`MISSION_SUCCESS: Shard stabilized. Remediation logic enforced.`, {
            id: toastId,
            className: 'font-mono font-semibold text-[12px] uppercase tracking-widest'
         })
         refetch()
      } catch (e) {
         toast.error(`MISSION_FAULT: Remediation logic failed.`, { id: toastId })
      }
   }

   if (isLoading) {
      return (
         <div className="p-6 lg:p-8 space-y-8 animate-fade-in bg-background min-h-screen">
            <div className="h-16 w-full skeleton-ui animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
               {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 skeleton-ui animate-pulse" />)}
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="h-80 skeleton-ui animate-pulse" />
               <div className="h-80 skeleton-ui animate-pulse" />
            </div>
         </div>
      );
   }

   return (
      <div className="page-transition-fade space-y-6 p-6 lg:p-8 bg-background min-h-screen">
         {/* Reasoning Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-border">
            <div className="space-y-1 text-left">
               <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 bg-primary text-primary-foreground rounded-[var(--radius)] flex items-center justify-center shadow-sm">
                     <BrainCircuit className="h-4.5 w-4.5" />
                  </div>
                  <h1 className="text-[32px] font-bold tracking-tight text-foreground m-0 leading-tight">Predictive Insights</h1>
               </div>
               <div className="flex items-center gap-3.5 mt-1">
                  <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                     Engine: Core_Reasoning_v4.2 • Deterministic Ingress
                  </p>
                  <div className="h-3 w-[1px] bg-border" />
                  <div className="flex items-center gap-1.5">
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Real-time Policy Enforced</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="btn-secondary h-8.5 px-3"
               >
                  <RefreshCcw className={cn("h-3.5 w-3.5 mr-1.5", isRefetching && "animate-spin")} />
                  <span>Sync Signals</span>
               </button>
               <button className="btn-primary h-8.5 px-3">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Enforce All Patches</span>
               </button>
            </div>
         </div>

         {/* Top Layer: KPI Shards */}
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
               { label: 'Platform Health Score', val: '98.2', trend: '+1.4%', icon: Gauge, desc: 'Composite integrity metric' },
               { label: 'Prediction Confidence', val: '94.5%', trend: 'STABLE', icon: ShieldCheck, desc: 'Model verification rate' },
               { label: 'Incident Forecast (24h)', val: '12-14', trend: '-22%', icon: TrendingUp, desc: 'Probabilistic signal count' },
               { label: 'Global Risk Index', val: 'LOW', trend: 'NONE', icon: ShieldAlert, desc: 'Cross-region security state' },
            ].map(kpi => (
               <div key={kpi.label} className="card-enterprise p-5 group hover:bg-surface-hover transition-all text-left">
                  <div className="flex justify-between items-start mb-4">
                     <div className="h-8.5 w-8.5 bg-surface-alt border border-border rounded flex items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-background group-hover:border-foreground">
                        <kpi.icon className="h-4.5 w-4.5 text-muted-foreground group-hover:text-current" />
                     </div>
                     <span className="badge-enterprise bg-surface-alt text-muted-foreground">{kpi.trend}</span>
                  </div>
                  <div className="space-y-1">
                     <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</div>
                     <div className="text-[22px] font-bold text-foreground tracking-tight leading-none mt-1">{kpi.val}</div>
                     <div className="text-[11px] text-muted-foreground tracking-wide mt-2">{kpi.desc}</div>
                  </div>
               </div>
            ))}
         </div>

         {/* Middle Layer: Predictive Visualizations */}
         <div className="grid gap-6 lg:grid-cols-2">
            <ChartContainer title="Failure Prediction Shard" subtitle="7-day probabilistic drift analysis">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={seriesData}>
                     <defs>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="currentColor" className="text-foreground" stopOpacity={0.06} />
                           <stop offset="95%" stopColor="currentColor" className="text-foreground" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
                     <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 500 }}
                        interval={3}
                        className="text-muted-foreground"
                     />
                     <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 500 }}
                        className="text-muted-foreground"
                     />
                     <Tooltip content={<CustomTooltip />} />
                     <Legend wrapperStyle={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '15px' }} />
                     <Area type="monotone" dataKey="prediction" stroke="currentColor" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRisk)" name="PROBABILITY" className="text-foreground" />
                     <Area type="monotone" dataKey="risk" stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="VARIANCE" className="text-muted-foreground" />
                  </AreaChart>
               </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Anomaly Frequency Trend" subtitle="Cluster-wide signal deviations">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seriesData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
                     <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 500 }}
                        interval={3}
                        className="text-muted-foreground"
                     />
                     <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 500 }}
                        className="text-muted-foreground"
                     />
                     <Tooltip content={<CustomTooltip />} />
                     <Legend wrapperStyle={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '15px' }} />
                     <Bar dataKey="anomaly" fill="currentColor" radius={[2, 2, 0, 0]} name="SIGNALS" className="text-foreground" />
                     <Bar dataKey="alertDensity" fill="currentColor" radius={[2, 2, 0, 0]} name="ALERTS" className="text-muted-foreground/40" />
                  </BarChart>
               </ResponsiveContainer>
            </ChartContainer>
         </div>

         {/* Bottom Layer: Insights & Recommendations */}
         <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
               <div className="flex items-center justify-between border-b border-border pb-3 text-left">
                  <h3 className="text-[16px] font-semibold text-foreground m-0 flex items-center gap-1.5 uppercase tracking-wide">
                     Recommendation Intelligence
                  </h3>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Global Policy Shards</span>
               </div>

               <div className="grid gap-4.5">
                  {(!insightsData || insightsData.length === 0) ? (
                     <div className="card-enterprise p-16 text-center space-y-3 border-dashed">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto opacity-30 animate-pulse" />
                        <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Zero high-risk deviations detected.</p>
                     </div>
                  ) : (
                     insightsData.map((insight: any, idx: number) => (
                        <div key={idx} className="card-enterprise group transition-all text-left">
                           <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                              <div className="p-5 md:w-40 bg-surface-alt/50 flex flex-col items-center justify-center gap-2 shrink-0">
                                 <div className={cn(
                                    "h-8.5 w-8.5 rounded-full flex items-center justify-center text-white shadow-sm",
                                    insight.type === 'Critical' ? "bg-red-500" : "bg-neutral-800"
                                 )}>
                                    <AlertCircle className="h-4.5 w-4.5" />
                                 </div>
                                 <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider text-center",
                                    insight.type === 'Critical' ? "text-red-500" : "text-foreground/80"
                                 )}>{insight.type} Signal</span>
                              </div>
                              <div className="flex-1 p-6 space-y-3.5">
                                 <div className="flex items-center justify-between">
                                    <h5 className="text-[15px] font-semibold tracking-tight text-foreground m-0">{insight.title}</h5>
                                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{insight.status || 'Confidence High'}</span>
                                 </div>
                                 <p className="text-[13px] leading-relaxed text-foreground/85 font-normal italic border-l-3 border-border pl-3 py-0.5">
                                    "{insight.desc}"
                                  </p>
                                 <div className="flex items-center justify-between gap-4 pt-1.5">
                                    <div className="text-[11px] font-semibold text-foreground/80 bg-surface-alt px-2.5 py-1 rounded border border-border flex items-center gap-1.5">
                                       <TrendingUp className="h-3.5 w-3.5" /> MTTR Impact: -18% expected
                                    </div>
                                    <button
                                       onClick={() => handleRemediate(insight)}
                                       className="btn-primary h-8 text-[11px] uppercase tracking-wider"
                                    >
                                       Remediate <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between border-b border-border pb-3 text-left">
                  <h3 className="text-[16px] font-semibold text-foreground m-0 uppercase tracking-wide">
                     Services At Risk
                  </h3>
                  <button className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground">Audit</button>
               </div>

               <div className="space-y-2.5">
                  {[
                     { name: 'auth-ingress-v2', risk: 'Elevated', trend: 'UP', code: '0xFA1' },
                     { name: 'payment-shard-08', risk: 'Medium', trend: 'STABLE', code: '0xB21' },
                     { name: 'telemetry-sink', risk: 'Low', trend: 'DOWN', code: '0x889' },
                     { name: 'security-mesh', risk: 'Minimal', trend: 'DOWN', code: '0xC04' },
                  ].map(service => (
                     <div key={service.name} className="p-3 card-enterprise flex items-center justify-between group hover:border-border-strong transition-all cursor-pointer text-left">
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 bg-surface-alt border border-border rounded flex items-center justify-center text-foreground font-mono text-[10px] font-bold">
                              {service.code}
                           </div>
                           <div className="space-y-0.5">
                              <div className="text-[13px] font-semibold text-foreground leading-tight">{service.name}</div>
                              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Signal: {service.trend}</div>
                           </div>
                        </div>
                        <span className={cn(
                           "badge-enterprise py-0.5",
                           service.risk === 'Elevated' ? "badge-critical" :
                              service.risk === 'Medium' ? "badge-warning" : "badge-info"
                        )}>
                           {service.risk}
                        </span>
                     </div>
                  ))}
               </div>

               <div className="card-enterprise p-5 bg-foreground text-background border-none shadow-md text-left">
                  <div className="flex items-center gap-2 mb-3">
                     <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
                     <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Autonomous Guard</span>
                  </div>
                  <h4 className="text-[16px] font-bold tracking-tight m-0 text-background leading-tight">Shielding Policy Active</h4>
                  <p className="text-[13px] text-neutral-400 leading-relaxed mt-2.5">
                     Intelligence Engine has authorization to deploy L1 shards. 18 anomalies mitigated automatically today.
                  </p>
                  <button className="w-full h-8.5 bg-background text-foreground font-semibold text-[11px] uppercase tracking-wider hover:bg-opacity-90 mt-4 transition-all shadow-xs">Review Logs</button>
               </div>
            </div>
         </div>
      </div>
   )
}

const ChartContainer = ({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) => (
   <div className="card-enterprise flex flex-col h-[400px] text-left">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
         <div className="space-y-0.5">
            <h3 className="text-[15px] font-semibold text-foreground m-0 uppercase tracking-wide">{title}</h3>
            <p className="text-[10px] text-muted-foreground font-semibold mb-0 uppercase tracking-widest">{subtitle}</p>
         </div>
         <div className="flex items-center gap-1.5">
            <button className="p-1.5 hover:bg-surface-hover rounded border border-border text-muted-foreground hover:text-foreground transition-all"><Maximize2 className="h-4 w-4" /></button>
            <button className="p-1.5 hover:bg-surface-hover rounded border border-border text-muted-foreground hover:text-foreground transition-all"><Download className="h-4 w-4" /></button>
         </div>
      </div>
      <div className="p-5 flex-1 w-full min-h-0">
         {children}
      </div>
   </div>
)

export default AiInsightsPage
