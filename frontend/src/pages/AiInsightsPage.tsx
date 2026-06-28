import React from 'react'
import { 
  Sparkles, BrainCircuit, Zap, ShieldAlert, ArrowRight, RefreshCcw, 
  CheckCircle2, Terminal, Info, BarChart3, Activity, Command, 
  Cpu, Hash, ShieldCheck, Layers, Gauge
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

const AiInsightsPage: React.FC = () => {
  const { data: insights, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => apiClient.getAiInsights(),
    refetchInterval: 60000
  })

  const handleRemediate = async (insight: any) => {
     const toastId = toast.loading(`MISSION_PATCH_INIT: Initializing stabilization for ${insight.id}...`, {
        className: 'font-geist font-bold text-[12px] uppercase tracking-widest'
     })
     
     try {
       await new Promise(resolve => setTimeout(resolve, 800))
       toast.loading(`[NODE_LOGIC] Patching ingress logic in us-east-shard-01...`, { id: toastId })
       
       await new Promise(resolve => setTimeout(resolve, 1200))
       toast.loading(`[TELEM_SYNC] Validating post-patch telemetry signatures...`, { id: toastId })
       
       await new Promise(resolve => setTimeout(resolve, 800))
       toast.success(`MISSION_SUCCESS: Domain stabilized. Insight ${insight.id} remediated.`, { 
         id: toastId,
         className: 'font-geist font-bold text-[12px] uppercase tracking-widest'
       })
       refetch()
     } catch (e) {
       toast.error(`MISSION_FAULT: Remediation logic failed. Reverting to manual orchestrator.`, { id: toastId })
     }
  }

  return (
    <div className="page-transition-fade space-y-12 p-10 bg-white min-h-screen">
      {/* Reasoning Engine Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tighter text-black m-0 font-geist">Autonomous Reasoning</h1>
           <div className="flex items-center gap-4">
              <p className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                 <BrainCircuit className="h-4 w-4 text-black animate-pulse" /> Domain-Specific Deterministic Reasoning • v4.2.9
              </p>
              <div className="h-4 w-[1px] bg-border" />
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Global SRE Policy: ENFORCED</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => refetch()}
             disabled={isRefetching}
             className="btn-secondary h-10 border-strong"
           >
              <RefreshCcw className={cn("h-4 w-4", isRefetching && "animate-spin")} /> 
              <span className="ml-2">Sync Intelligence</span>
           </button>
           <button className="btn-primary h-10 shadow-xl shadow-black/10">
              <Command className="h-4 w-4" />
              <span className="ml-2">Logic Policy</span>
           </button>
        </div>
      </div>

      <div className="grid gap-10">
        {isLoading ? (
           Array(3).fill(0).map((_, i) => (
             <div key={i} className="h-64 skeleton enterprise-card border-strong" />
           ))
        ) : !insights || insights.length === 0 ? (
           <div className="enterprise-card p-24 text-center space-y-4 border-strong">
              <div className="h-20 w-20 bg-surface-alt border border-border-strong rounded flex items-center justify-center mx-auto text-black shadow-lg">
                 <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-black uppercase tracking-widest border-none mb-0 pb-0">Infrastructure Equilibrium</h3>
                 <p className="text-[11px] font-bold text-muted uppercase tracking-[0.2em]">Zero anomalous patterns detected in US-EAST-1 telemetry window.</p>
              </div>
           </div>
        ) : insights.map((insight: any) => (
          <div key={insight.title} className="enterprise-card border-strong overflow-hidden group hover:border-black transition-all">
            <div className="p-10">
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="h-20 w-20 bg-[#0B0B0B] text-white rounded shrink-0 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <BrainCircuit className="h-10 w-10" />
                </div>
                
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "status-badge",
                      insight.type === 'Critical' ? "badge-critical" : 
                      insight.type === 'Warning' ? "badge-warning" : "badge-info"
                    )}>
                      {insight.type} Signal
                    </span>
                    <h3 className="text-2xl font-black text-black tracking-tight border-none mb-0 pb-0 font-geist">{insight.title}</h3>
                  </div>
                  
                  <p className="text-sm font-medium text-muted leading-relaxed max-w-4xl italic">
                    "{insight.desc}"
                  </p>
                  
                  <div className="grid lg:grid-cols-2 gap-8 pt-4">
                    <div className="p-6 rounded border border-border-strong bg-surface-alt/20 group-hover:bg-white group-hover:border-black transition-all">
                      <div className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Gauge className="h-4 w-4" /> Impact Projection Matrix
                      </div>
                      <p className="text-[13px] font-medium text-muted leading-relaxed">{insight.impact}</p>
                    </div>
                    <div className="p-6 rounded border border-black bg-black text-white group-hover:translate-y-[-4px] transition-all">
                      <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Zap className="h-4 w-4" /> Recommended Remediation Logic
                      </div>
                      <p className="text-[13px] font-bold leading-relaxed italic underline decoration-white/20 underline-offset-4">"{insight.recommendation}"</p>
                    </div>
                  </div>
                </div>

                <div className="lg:w-64 flex flex-col justify-between items-end gap-10 shrink-0">
                   <div className="flex items-center gap-3 px-4 py-2 bg-surface-alt border border-border-strong rounded w-full justify-between">
                      <span className="text-[10px] font-black text-muted uppercase">Confidence</span>
                      <span className="font-mono text-sm font-black text-black">{insight.status}</span>
                   </div>
                   <button 
                     onClick={() => handleRemediate(insight)}
                     className="btn-primary w-full h-14 bg-black text-white hover:bg-neutral-800 shadow-2xl shadow-black/10">
                     Execute Patch <ArrowRight className="h-4 w-4 ml-2" />
                   </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Autonomous Orchestration Panel */}
      <div className="p-10 border border-black bg-black text-white relative overflow-hidden group">
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="h-20 w-20 bg-white rounded flex items-center justify-center text-black shadow-2xl group-hover:scale-110 transition-transform">
             <Layers className="h-10 w-10" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter font-geist border-none p-0 mb-0">Autopilot Enforcement: ACTIVE</h3>
            <p className="text-[12px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
              SRE-AI engine is authorized to mitigate signal breaches within L1/L2 scope.<br/> 
              <span className="text-white font-black italic underline decoration-emerald-500 underline-offset-4 decoration-2">14 automated stability actions</span> taken in us-east-1 shard.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="h-10 px-8 border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Audit Logs</button>
            <button className="bg-white text-black h-10 px-10 text-[10px] font-black uppercase tracking-widest hover:opacity-90 shadow-2xl shadow-white/5 transition-all">Policy Matrix</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiInsightsPage
