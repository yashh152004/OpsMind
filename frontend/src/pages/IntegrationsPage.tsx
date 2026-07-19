import React, { useState } from 'react'
import { 
  Cloud, Terminal, Database, ShieldCheck, Activity, ArrowRight,
  Plus, RefreshCw, Trash2, Lock, Search, Webhook,
  Globe, X
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'

const categories = ["Cloud Infrastructure", "Telemetry Sinks", "Incident Messaging", "Security"]

const IntegrationsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Channels")
  const [isProvisioning, setIsProvisioning] = useState(false)

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => apiClient.getIntegrations()
  })

  return (
    <div className="page-transition-fade space-y-6 p-6 lg:p-8 bg-background min-h-screen">
      {/* Integrations Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-border">
        <div className="space-y-1 text-left">
           <h1 className="text-[32px] font-bold tracking-tight text-foreground m-0 leading-tight">Channel Management</h1>
           <div className="flex items-center gap-2.5 mt-1">
              <span className="badge-enterprise bg-surface-alt border border-border py-0.5">
                 <Webhook className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                 Signal Mesh
              </span>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted-foreground">
                 Managing <span className="text-foreground font-semibold">8 active data connectors</span> and telemetry ingestors.
              </p>
           </div>
        </div>
        <button 
          onClick={() => setIsProvisioning(true)}
          className="btn-primary h-8.5 px-3"
        >
           <Plus className="h-4 w-4" />
           <span>Provision Connector</span>
        </button>
      </div>

      {/* Selective Filter Navigation */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-surface-alt rounded-[var(--radius)] border border-border w-fit text-left">
         {["All Channels", ...categories].map(cat => (
           <button 
             key={cat}
             onClick={() => setSelectedCategory(cat)}
             className={cn(
               "px-3.5 py-1 text-[11px] font-medium transition-all rounded-[var(--radius)]",
               selectedCategory === cat 
                ? "bg-background text-foreground shadow-xs border border-border" 
                : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/50"
             )}
           >
             {cat}
           </button>
         ))}
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative group flex-1 w-full">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
             <input 
               type="text" 
               placeholder="Filter by connector name, ID, or source..." 
               className="input-enterprise pl-9 h-8.5 w-full font-normal" 
             />
          </div>
          <div className="h-8.5 px-4 border border-border rounded-[var(--radius)] flex items-center gap-6 text-[11px] font-semibold text-muted-foreground bg-surface-alt shrink-0 self-end sm:self-auto">
             <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-foreground">8 Linked</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-border" />
                <span>14 Available</span>
             </div>
          </div>
      </div>

      {/* Grid Matrix */}
      <div className="grid gap-4.5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-48 skeleton-ui opacity-80 rounded-[var(--radius)] animate-pulse" />
          ))
        ) : (integrations || [])?.map((app: any) => {
          const Icon = app.name.includes('AWS') ? Cloud : app.name.includes('Elastic') ? Database : app.name.includes('Prometheus') ? Activity : Terminal
          return (
            <div key={app.id} className="card-enterprise group flex flex-col hover:border-border-strong transition-all text-left">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 bg-surface-alt border border-border rounded-[var(--radius)] flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all">
                    <Icon className="h-4.5 w-4.5 text-muted-foreground group-hover:text-current" />
                  </div>
                  <span className={cn(
                    "badge-enterprise py-0.5",
                    app.connected ? "badge-success" : "badge-info"
                  )}>
                     {app.connected ? 'Linked' : 'Inactive'}
                  </span>
                </div>
                
                <div>
                   <h3 className="text-[14px] font-semibold tracking-tight text-foreground m-0 uppercase">{app.name}</h3>
                   <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1 flex items-center gap-1.5 italic">
                      Type <span className="opacity-40">•</span> {app.type || app.source}
                   </div>
                </div>
 
                {app.connected && (
                   <div className="pt-3 border-t border-border flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Ingress State</span>
                         <span className="text-[10px] font-semibold text-emerald-500 uppercase">NOMINAL</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Heartbeat</span>
                         <span className="text-[10px] font-semibold text-foreground">LAT 1.2ms</span>
                      </div>
                   </div>
                )}
              </div>

              <div className="p-3 bg-surface-alt border-t border-border flex items-center justify-between">
                 <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider pl-1">Doc Shards</button>
                 {app.connected ? (
                    <div className="flex gap-1.5">
                       <button className="btn-secondary h-8 w-8 p-0 flex items-center justify-center"><RefreshCw className="h-3.5 w-3.5 text-muted-foreground" /></button>
                       <button className="btn-secondary h-8 w-8 p-0 flex items-center justify-center text-red-500 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                 ) : (
                    <button className="btn-primary h-7 px-3 text-[10px] uppercase tracking-wider">Provision</button>
                 )}
              </div>
            </div>
          )
        })}

        {/* Available Template Card */}
        {["Slack Payload", "PagerDuty", "Elastic Search", "CloudWatch"].map(plat => (
          <div key={plat} className="card-enterprise border-dashed border-2 opacity-70 hover:opacity-100 cursor-pointer flex flex-col items-center justify-center p-8 text-center space-y-4 group transition-all">
             <div className="h-10 w-10 rounded-[var(--radius)] bg-surface-alt border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all shadow-xs">
                <Globe className="h-5 w-5 text-muted-foreground group-hover:text-current" />
              </div>
             <div>
                <h4 className="text-[13px] font-semibold text-foreground uppercase tracking-widest leading-none">{plat}</h4>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1.5">Connect Matrix Sink</p>
             </div>
          </div>
        ))}
      </div>

      {/* Provisioning Shard Modal */}
      {isProvisioning && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[500] flex items-center justify-center p-4 animate-fade-in">
            <div className="card-enterprise max-w-md w-full p-0 overflow-hidden shadow-2xl animate-in zoom-in-95">
               <div className="px-6 py-4.5 border-b border-border bg-surface-alt flex items-center justify-between relative text-left">
                  <div className="flex items-center gap-3">
                     <div className="h-8.5 w-8.5 bg-primary text-primary-foreground flex items-center justify-center rounded-[var(--radius)] shadow-sm">
                        <Webhook className="h-4.5 w-4.5" />
                     </div>
                     <div>
                        <h2 className="text-[16px] font-bold text-foreground m-0">Inbound Data Protocol</h2>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mt-0.5">Step 01 / Identity Verification</p>
                     </div>
                  </div>
                  <button onClick={() => setIsProvisioning(false)} className="p-1.5 hover:bg-surface-hover rounded-full transition-colors">
                     <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  </button>
               </div>

               <div className="p-6 space-y-5 text-left">
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="label-enterprise">Cloud Provider Shard</label>
                        <select className="select-field h-9.5 font-medium cursor-pointer">
                           <option>US-EAST-1 (N. VIRGINIA)</option>
                           <option>US-WEST-2 (OREGON)</option>
                           <option>EU-CENTRAL-1 (FRANKFURT)</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="label-enterprise">Logic Stream Key</label>
                        <div className="relative h-9.5">
                           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground font-light" />
                           <input type="password" placeholder="arn:shards:iam::matrix" className="input-enterprise pl-9 h-9.5 w-full text-[12px] font-mono" />
                        </div>
                     </div>
                  </div>

                  <div className="p-4 bg-surface-alt border border-border rounded-[var(--radius)] flex items-start gap-3">
                     <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                     <p className="text-[12px] font-normal leading-normal text-foreground/80 italic m-0">
                       Protocol requires read-only administrative access for telemetry replication. Keys are encrypted via hardware-level KMS modules and never stored in plain-text.
                     </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                     <button onClick={() => setIsProvisioning(false)} className="btn-secondary h-9 px-4">Cancel</button>
                     <button className="btn-primary h-9 px-4 flex items-center justify-center">
                        <span>Secure Sync</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

export default IntegrationsPage
