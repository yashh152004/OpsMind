import React, { useState } from 'react'
import { 
  Cloud, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Activity, 
  ArrowRight,
  Plus,
  RefreshCw,
  Trash2,
  Lock,
  Search,
  Filter,
  Webhook,
  ChevronRight,
  Monitor,
  Zap,
  Globe
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
    <div className="page-transition-fade space-y-8 p-6 lg:p-8 bg-background min-h-screen">
      {/* Integrations Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold tracking-tight text-foreground m-0">Channel Management</h1>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-0.5 bg-neutral-100 border border-border rounded text-[11px] font-bold uppercase tracking-wider">
                 <Webhook className="h-3.5 w-3.5 text-foreground" />
                 Signal Mesh
              </div>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted">
                 Managing <span className="text-foreground font-bold">8 active data connectors</span> and telemetry ingestors.
              </p>
           </div>
        </div>
        <button 
          onClick={() => setIsProvisioning(true)}
          className="btn-primary h-9 px-4 h-9"
        >
           <Plus className="h-4 w-4" />
           <span className="ml-2">Provision Connector</span>
        </button>
      </div>

      {/* Selective Filter Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-alt rounded-lg border border-border w-fit">
         {["All Channels", ...categories].map(cat => (
           <button 
             key={cat}
             onClick={() => setSelectedCategory(cat)}
             className={cn(
               "px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all rounded",
               selectedCategory === cat 
                ? "bg-white text-foreground shadow-sm border border-border" 
                : "text-muted hover:text-foreground"
             )}
           >
             {cat}
           </button>
         ))}
      </div>

      {/* Search & Stats */}
      <div className="flex items-center gap-4">
          <div className="relative group max-w-sm flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-foreground transition-colors" />
             <input 
               type="text" 
               placeholder="Filter by connector name, ID, or source type..." 
               className="input-enterprise pl-10 h-10 w-full" 
             />
          </div>
          <div className="h-10 px-4 border border-border rounded-md flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted">
             <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>8 Linked</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                <span>14 Available</span>
             </div>
          </div>
      </div>

      {/* Grid Matrix */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-48 skeleton-ui opacity-80 rounded-xl" />
          ))
        ) : (integrations || [])?.map((app: any) => {
          const Icon = app.name.includes('AWS') ? Cloud : app.name.includes('Elastic') ? Database : app.name.includes('Prometheus') ? Activity : Terminal;
          return (
            <div key={app.id} className="card-enterprise group flex flex-col hover:border-foreground transition-all">
              <div className="p-5 flex-1 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 bg-surface-alt border border-border rounded-lg flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  {app.connected ? (
                     <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-black uppercase tracking-widest">
                        Linked
                     </div>
                  ) : (
                     <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-50 text-neutral-400 border border-neutral-100 rounded text-[9px] font-black uppercase tracking-widest">
                        Inactive
                     </div>
                  )}
                </div>
                
                <div>
                   <h3 className="text-[14px] font-bold text-foreground m-0">{app.name}</h3>
                   <div className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5 italic">
                      Shard Source <span className="opacity-80">•</span> {app.type || app.source}
                   </div>
                </div>

                {app.connected && (
                   <div className="pt-4 border-t border-border flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Ingress State</span>
                         <span className="text-[10px] font-bold text-foreground">OK</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Heartbeat</span>
                         <span className="text-[10px] font-bold text-foreground">LAT 1.2ms</span>
                      </div>
                   </div>
                )}
              </div>

              <div className="p-3 bg-surface-alt/40 border-t border-border flex items-center justify-between">
                 <button className="text-[10px] font-bold text-muted hover:text-foreground transition-colors uppercase tracking-widest">Doc_Shards</button>
                 {app.connected ? (
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors text-muted"><RefreshCw className="h-3 w-3" /></button>
                      <button className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-600"><Trash2 className="h-3 w-3" /></button>
                    </div>
                 ) : (
                    <button className="btn-primary h-7 px-3 text-[10px] font-bold uppercase tracking-widest">Provision</button>
                 )}
              </div>
            </div>
          );
        })}

        {/* Available Template Card */}
        {["Slack Payload", "PagerDuty", "Elastic Search", "CloudWatch"].map(plat => (
          <div key={plat} className="card-enterprise border-dashed opacity-90 grayscale hover:opacity-100 hover:grayscale-0 cursor-pointer flex flex-col items-center justify-center p-8 text-center space-y-4 group transition-all">
             <div className="h-12 w-12 rounded-xl bg-surface-alt border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all">
                <Globe className="h-6 w-6" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">{plat}</h4>
                <p className="text-[10px] text-muted font-medium px-2 italic mt-1 leading-relaxed">Establish signal sink for real-time operational analysis.</p>
             </div>
          </div>
        ))}
      </div>

      {/* Provisioning Shard Modal */}
      {isProvisioning && (
         <div className="fixed inset-0 bg-foreground/20 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
            <div className="card-enterprise max-w-xl w-full p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-border bg-surface-alt flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 bg-foreground text-background flex items-center justify-center rounded-lg shadow-xl">
                        <Zap className="h-6 w-6" />
                     </div>
                     <div>
                        <h2 className="text-lg font-bold text-foreground m-0">Inbound Data Protocol</h2>
                        <p className="text-[10px] text-muted uppercase font-bold tracking-[0.2em] mt-0.5">Step 01 / Identity Verification</p>
                     </div>
                  </div>
                  <button onClick={() => setIsProvisioning(false)} className="text-muted hover:text-foreground text-xl font-light">&times;</button>
               </div>

               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5 flex flex-col">
                        <label className="label-enterprise">Cloud Provider Shard</label>
                        <select className="input-enterprise h-10 w-full bg-white font-bold text-[12px]">
                           <option>US-EAST-1 (N. VIRGINIA)</option>
                           <option>US-WEST-2 (OREGON)</option>
                           <option>EU-CENTRAL-1 (FRANKFURT)</option>
                        </select>
                     </div>
                     <div className="space-y-1.5 flex flex-col">
                        <label className="label-enterprise">Logic Stream Key</label>
                        <div className="relative h-10">
                           <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                           <input type="password" placeholder="arn:shards:iam::matrix" className="input-enterprise pl-10 h-10 w-full text-[12px]" />
                        </div>
                     </div>
                  </div>

                  <div className="p-4 bg-surface-alt/50 border border-border rounded-lg flex items-start gap-4">
                     <ShieldCheck className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                     <p className="text-[11px] font-medium leading-relaxed text-muted line-clamp-2">
                       Protocol requires read-only administrative access for telemetry replication. Keys are encrypted via hardware-level KMS modules.
                     </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                     <button onClick={() => setIsProvisioning(false)} className="btn-secondary h-10 px-6 font-bold uppercase tracking-widest text-[11px]">Abort</button>
                     <button className="btn-primary h-10 px-6 font-bold uppercase tracking-widest text-[11px]">
                        Sync Shard <ArrowRight className="h-4 w-4 ml-2" />
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
