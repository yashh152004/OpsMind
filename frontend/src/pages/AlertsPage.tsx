import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Bell, 
  BellOff, 
  ShieldAlert, 
  Terminal,
  Activity,
  ArrowRight,
  Filter,
  Layers,
  Database
} from 'lucide-react'
import { cn } from '@/utils/cn'

const AlertsPage: React.FC = () => {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiClient.getAlerts('default'),
    refetchInterval: 10000 // Real-time feed simulation
  })

  return (
    <div className="space-y-6 page-transition">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-outfit">Operational Signal Stream</h1>
          <p className="text-muted-foreground text-sm font-medium">Monitoring raw events and high-cardinality signals.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 px-3 bg-card border border-border rounded-md flex items-center gap-2 text-xs font-bold text-muted-foreground">
             <Filter className="h-3.5 w-3.5" />
             Source: All
          </div>
          <button className="btn-secondary h-9 text-xs">
            <BellOff className="h-3.5 w-3.5 mr-1" />
            Silence Node
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-card border border-border rounded-lg skeleton" />
          ))
        ) : !alerts || alerts.length === 0 ? (
           <div className="enterprise-card p-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center border border-border">
                <BellOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="max-w-xs">
                <h3 className="font-bold text-lg">No Active Signal</h3>
                <p className="text-sm text-muted-foreground">The event stream is currently clear. All infrastructure sensors are reporting healthy heartbeats.</p>
              </div>
           </div>
        ) : alerts.map((alert: any) => (
          <div 
            key={alert.id} 
            className={cn(
              "enterprise-card p-4 flex items-center gap-6 group hover:border-primary transition-all cursor-pointer",
              alert.status === 'TRIGGERED' ? "border-l-4 border-l-destructive shadow-sm" : "border-l-4 border-l-emerald-500"
            )}
          >
            <div className={cn(
              "h-10 w-10 border rounded flex items-center justify-center shrink-0",
              alert.status === 'TRIGGERED' ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            )}>
              {alert.status === 'TRIGGERED' ? <ShieldAlert className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-sm truncate">{alert.alertName}</h3>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-accent px-1.5 py-0.5 rounded border border-border">
                  {alert.source}
                </span>
              </div>
              <p className="text-muted-foreground text-[10px] font-mono truncate uppercase flex items-center gap-2">
                 {alert.message}
              </p>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-8 px-6 border-x border-border">
               <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">Subsystem</div>
                  <div className="text-[10px] font-mono flex items-center gap-1.5">
                    <Layers className="h-3 w-3" /> US-EAST-NODE-42
                  </div>
               </div>
               <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">Payload</div>
                  <div className="text-[10px] font-mono flex items-center gap-1.5">
                    <Database className="h-3 w-3" /> INT_64_TRACE
                  </div>
               </div>
            </div>

            <div className="hidden xl:flex flex-col items-end gap-1 w-24">
              <div className="text-[9px] font-bold text-muted-foreground uppercase">Timestamp</div>
              <div className="text-[11px] font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</div>
            </div>

            <div className="flex items-center gap-3">
               <button className="h-8 w-8 rounded bg-accent border border-border flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Panel */}
      <div className="p-8 rounded-lg bg-accent/40 border border-border mt-12 flex flex-col md:flex-row items-center justify-between gap-8 group">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Terminal className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Signal Sources</h3>
            <p className="text-muted-foreground text-xs font-medium max-w-sm">Establish new data sinks for Prometheus, CloudWatch, or custom gRPC listeners.</p>
          </div>
        </div>
        <button className="btn-primary h-10 px-6 text-sm">
          Provision Connector
        </button>
      </div>
    </div>
  )
}

export default AlertsPage
