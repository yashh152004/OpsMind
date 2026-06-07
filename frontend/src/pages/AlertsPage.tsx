import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Bell, 
  BellOff, 
  ShieldAlert, 
  Terminal,
  Activity,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/utils/cn'

const AlertsPage: React.FC = () => {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiClient.getAlerts('default'),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit">Alert Stream</h1>
          <p className="text-muted-foreground">Real-time alerts from your infrastructure and applications.</p>
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 text-sm font-medium">
          <BellOff className="h-4 w-4" />
          Silence All
        </button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 glass-card animate-pulse" />
          ))
        ) : alerts?.map((alert: any) => (
          <div key={alert.id} className="glass-card p-6 flex items-center gap-6 group hover:border-primary/30 transition-all cursor-pointer">
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
              alert.status === 'TRIGGERED' ? "bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-emerald-500/10 text-emerald-500"
            )}>
              {alert.status === 'TRIGGERED' ? <ShieldAlert className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-lg">{alert.alertName}</h3>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                  {alert.source}
                </span>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-1">{alert.message}</p>
            </div>

            <div className="hidden md:flex flex-col items-end gap-1 px-8 border-x border-white/5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Timestamp</div>
              <div className="text-sm font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</div>
            </div>

            <div className="flex items-center gap-3">
               <button className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <ArrowRight className="h-5 w-5" />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/5 mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center">
            <Terminal className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-outfit">Add More Signal</h3>
            <p className="text-muted-foreground text-sm max-w-md">Connect your Prometheus, CloudWatch, or Grafana alerts to the OpsMind stream.</p>
          </div>
        </div>
        <button className="btn-primary py-3">
          Configure Integrations
        </button>
      </div>
    </div>
  )
}

export default AlertsPage
