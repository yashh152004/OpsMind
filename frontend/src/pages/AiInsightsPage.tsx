import React from 'react'
import { 
  Sparkles, 
  BrainCircuit, 
  Zap, 
  ShieldAlert,
  ArrowRight,
  RefreshCcw,
  CheckCircle2,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

const AiInsightsPage: React.FC = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => apiClient.getAiInsights()
  })

  const handleRemediate = (insight: any) => {
     toast.promise(
       new Promise((resolve) => setTimeout(resolve, 1500)),
       {
         loading: `AI SRE executing remediation: ${insight.recommendation}...`,
         success: `System stabilized. Patch applied to ${insight.title}.`,
         error: 'Remediation failed. Manual intervention required.'
       }
     )
  }

  return (
    <div className="space-y-8 pb-12 page-transition">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
             <Sparkles className="h-6 w-6 text-blue-600 fill-blue-600/10" />
             Autonomous Intelligence Engine
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Predictive risk assessment and infrastructure auto-scaling recommendations.</p>
        </div>
        <button className="btn-secondary h-9 text-xs" onClick={() => window.location.reload()}>
           <RefreshCcw className="h-3.5 w-3.5 mr-2" />
           Sync Reasoning Engine
        </button>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
           Array(3).fill(0).map((_, i) => (
             <div key={i} className="h-48 enterprise-card skeleton" />
           ))
        ) : !insights || insights.length === 0 ? (
           <div className="enterprise-card p-20 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg">Infrastructure is Stable</h3>
              <p className="text-sm text-muted-foreground">AI has not detected any anomalous patterns or impending risks in the current telemetry window.</p>
           </div>
        ) : insights.map((insight: any) => (
          <div key={insight.title} className="enterprise-card overflow-hidden group">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className={cn(
                  "h-14 w-14 rounded bg-accent border border-border shrink-0 flex items-center justify-center transition-colors",
                  insight.type === 'Critical' ? "text-destructive border-destructive/20 bg-destructive/5" : "text-primary"
                )}>
                  <BrainCircuit className="h-7 w-7" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "status-badge",
                      insight.type === 'Critical' ? "badge-critical" : 
                      insight.type === 'Warning' ? "badge-warning" : "badge-info"
                    )}>
                      {insight.type}
                    </span>
                    <h3 className="text-lg font-bold font-outfit">{insight.title}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                    {insight.desc}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 pt-2">
                    <div className="p-4 rounded border border-border bg-accent/20">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="h-3 w-3" /> Impact Analysis
                      </div>
                      <p className="text-xs font-bold text-foreground/80 leading-relaxed">{insight.impact}</p>
                    </div>
                    <div className="p-4 rounded border border-primary/20 bg-primary/5">
                      <div className="text-[9px] font-bold text-primary uppercase mb-2 flex items-center gap-1.5">
                        <Zap className="h-3 w-3" /> Autonomous Recommendation
                      </div>
                      <p className="text-xs font-bold text-foreground leading-relaxed italic">"{insight.recommendation}"</p>
                    </div>
                  </div>
                </div>

                <div className="md:w-56 flex flex-col justify-between items-end">
                   <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      STATUS: {insight.status}
                   </div>
                   <button 
                     onClick={() => handleRemediate(insight)}
                     className="btn-primary w-full h-9 text-xs mt-4 md:mt-0 shadow-lg shadow-blue-500/10 transition-all hover:-translate-y-0.5 active:translate-y-0">
                     Execute Remediation <ArrowRight className="h-3 w-3 ml-2" />
                   </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Autopilot Status Panel */}
      <div className="enterprise-card p-6 bg-accent/20 border-t-2 border-t-primary">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-4 ring-primary/5">
             <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold">Autopilot Mode: Active</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              OpsMind AI is authorized to execute non-destructive remediations. 12 automated actions taken in the last 24h.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary h-9 text-xs" onClick={() => window.location.href='/settings'}>View Action Log</button>
            <button className="btn-primary h-9 text-xs">Configure Rules</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiInsightsPage
