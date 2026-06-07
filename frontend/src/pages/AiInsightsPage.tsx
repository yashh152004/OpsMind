import React from 'react'
import { 
  Sparkles, 
  BrainCircuit, 
  Zap, 
  ShieldAlert,
  ArrowRight,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/utils/cn'

const insights = [
  {
    type: "Critical",
    title: "Predictive Capacity Exhaustion",
    desc: "Storage volume 'prod-data-01' is projected to reach 95% capacity in 4.2 hours based on current write trends.",
    impact: "Potential data loss or service unavailability for Payment API.",
    recommendation: "Increase volume size to 2TB or purge logs older than 7 days.",
    status: "Active",
    color: "text-red-500",
    bg: "bg-red-500/10"
  },
  {
    type: "Warning",
    title: "Anomaly: CPU Pattern Shift",
    desc: "Auth-Worker service is exhibiting unusual CPU spikes not correlated with request traffic (Cyclical every 12min).",
    impact: "Degraded performance for login requests during spikes.",
    recommendation: "Investigate cron jobs or GC behavior in Auth-Worker build #42.",
    status: "Investigating",
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  },
  {
    type: "Optimization",
    title: "Underutilized Infrastructure",
    desc: "3 staging nodes in 'us-west-2' have had < 5% CPU usage for 14 consecutive days.",
    impact: "Estimated wasted spend: $420 / month.",
    recommendation: "Consolidate workloads and decommission unused instances.",
    status: "Pending Action",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  }
]

const AiInsightsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit flex items-center gap-3">
             <Sparkles className="h-8 w-8 text-purple-500" />
             AI Intelligence Insights
          </h1>
          <p className="text-muted-foreground mt-1">Autonomous risk detection and infrastructure optimizations powered by OpsMind AI.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all font-bold text-sm">
           <RefreshCcw className="h-4 w-4" />
           Force Re-scan
        </button>
      </div>

      <div className="grid gap-6">
        {insights.map((insight) => (
          <div key={insight.title} className="glass-card overflow-hidden group">
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className={cn("h-16 w-16 rounded-2xl shrink-0 flex items-center justify-center", insight.bg, insight.color)}>
                  <BrainCircuit className="h-8 w-8" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border", insight.color.replace('text-', 'border-').replace('500', '500/30'))}>
                      {insight.type}
                    </span>
                    <h3 className="text-xl font-bold font-outfit">{insight.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{insight.desc}</p>
                  
                  <div className="mt-6 grid md:grid-cols-2 gap-8">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Potential Impact
                      </div>
                      <p className="text-sm font-medium">{insight.impact}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="text-[10px] font-bold text-primary uppercase mb-2 flex items-center gap-1">
                        <Zap className="h-3 w-3" /> Recommended Action
                      </div>
                      <p className="text-sm font-bold text-foreground/90">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>

                <div className="md:w-48 text-right flex flex-col justify-between">
                   <div className="flex items-center justify-end gap-2 text-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold">{insight.status}</span>
                   </div>
                   <button className="flex items-center justify-end gap-2 text-primary font-bold group-hover:translate-x-1 transition-transform">
                     Execute recommendation <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-10 bg-gradient-to-br from-purple-600/5 to-blue-600/5 border-t-4 border-purple-500">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-purple-500/20 flex items-center justify-center border-4 border-purple-500/30">
             <CheckCircle2 className="h-10 w-10 text-purple-500" />
          </div>
          <div>
            <h3 className="text-2xl font-bold font-outfit mb-2">Automated Resolutions Active</h3>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              Your "Autopilot" mode is enabled. OpsMind AI has already resolved 12 minor anomalies in the last 24 hours without requiring SRE intervention.
            </p>
          </div>
          <button className="ml-auto btn-primary whitespace-nowrap">
            View Autopilot Logs
          </button>
        </div>
      </div>
    </div>
  )
}

export default AiInsightsPage
