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
           <h1 className="text-4xl font-black tracking-tighter text-foreground m-0">Channel Management</h1>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-surface-alt border border-border-strong rounded text-[11px] font-black uppercase tracking-widest shadow-sm">
                 <Webhook className="h-3.5 w-3.5 text-foreground" />
                 Signal Mesh
              </div>
              <span className="text-border-strong">|</span>
              <p className="text-[12px] font-bold text-muted uppercase tracking-widest">
                 Managing <span className="text-foreground font-black">8 active data connectors</span> and telemetry ingestors.
              </p>
           </div>
        </div>
        <button 
          onClick={() => setIsProvisioning(true)}
          className="h-10 bg-black text-white px-6 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center"
        >
           <Plus className="h-4 w-4 mr-2" />
           <span>Provision Connector</span>
        </button>
      </div>

      {/* Selective Filter Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface-alt rounded-xl border border-border w-fit shadow-inner">
         {["All Channels", ...categories].map(cat => (
           <button 
             key={cat}
             onClick={() => setSelectedCategory(cat)}
             className={cn(
               "px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-lg",
               selectedCategory === cat 
                ? "bg-black text-white shadow-lg border border-black" 
                : "text-secondary hover:text-foreground hover:bg-white/50"
             )}
           >
             {cat}
           </button>
         ))}
      </div>

      {/* Search & Stats */}
      <div className="flex items-center gap-4">
          <div className="relative group max-w-md flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted group-focus-within:text-foreground transition-colors" />
             <input 
               type="text" 
               placeholder="Filter by connector name, ID, or source type..." 
               className="input-enterprise pl-12 h-12 w-full shadow-sm" 
             />
          </div>
          <div className="h-12 px-6 border-2 border-border rounded-xl flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-muted bg-surface-alt">
             <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-foreground">8 Linked</span>
             </div>
             <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-neutral-300" />
                <span>14 Available</span>
             </div>
          </div>
      </div>

      {/* Grid Matrix */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-56 skeleton-ui opacity-80 rounded-xl" />
          ))
        ) : (integrations || [])?.map((app: any) => {
          const Icon = app.name.includes('AWS') ? Cloud : app.name.includes('Elastic') ? Database : app.name.includes('Prometheus') ? Activity : Terminal;
          return (
            <div key={app.id} className="card-enterprise group flex flex-col hover:border-foreground transition-all shadow-sm hover:shadow-xl">
              <div className="p-6 flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 bg-surface-alt border border-border rounded-xl flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                  {app.connected ? (
                     <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[9px] font-black uppercase tracking-widest shadow-sm">
                        Linked
                     </div>
                  ) : (
                     <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-alt text-secondary border border-border-strong rounded text-[9px] font-black uppercase tracking-widest">
                        Inactive
                     </div>
                  )}
                </div>
                
                <div>
                   <h3 className="text-[15px] font-black tracking-tight text-foreground m-0 uppercase">{app.name}</h3>
                   <div className="text-[10px] text-secondary font-black uppercase tracking-[0.1em] mt-1 flex items-center gap-1.5 italic">
                      Shard Source <span className="opacity-40">•</span> {app.type || app.source}
                   </div>
                </div>

                {app.connected && (
                   <div className="pt-5 border-t-2 border-border flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted">Ingress State</span>
                         <span className="text-[11px] font-black text-emerald-600">NOMINAL</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted">Heartbeat</span>
                         <span className="text-[11px] font-black text-foreground">LAT 1.2ms</span>
                      </div>
                   </div>
                )}
              </div>

              <div className="p-4 bg-surface-alt border-t border-border flex items-center justify-between">
                 <button className="text-[10px] font-black text-muted hover:text-foreground transition-colors uppercase tracking-[0.2em]">Doc_Shards</button>
                 {app.connected ? (
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-black hover:text-white rounded-lg border border-transparent transition-all text-secondary"><RefreshCw className="h-3.5 w-3.5" /></button>
                      <button className="p-2 hover:bg-critical hover:text-white rounded-lg border border-transparent transition-all text-secondary"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                 ) : (
                    <button className="px-4 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-all">Provision</button>
                 )}
              </div>
            </div>
          );
        })}

        {/* Available Template Card */}
        {["Slack Payload", "PagerDuty", "Elastic Search", "CloudWatch"].map(plat => (
          <div key={plat} className="card-enterprise border-dashed border-2 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 cursor-pointer flex flex-col items-center justify-center p-10 text-center space-y-5 group transition-all">
             <div className="h-14 w-14 rounded-2xl bg-surface-alt border-2 border-border flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-black transition-all shadow-inner">
                <Globe className="h-7 w-7" />
              </div>
             <div>
                <h4 className="text-[13px] font-black text-foreground uppercase tracking-[0.15em]">{plat}</h4>
                <p className="text-[10px] text-secondary font-bold px-3 italic mt-2 leading-relaxed uppercase tracking-widest">Connect Matrix Sink</p>
             </div>
          </div>
        ))}
      </div>

      {/* Provisioning Shard Modal */}
      {isProvisioning && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="card-enterprise max-w-xl w-full p-0 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300">
               <div className="p-8 border-b border-border bg-surface-alt flex items-center justify-between relative">
                  <div className="flex items-center gap-5">
                     <div className="h-12 w-12 bg-black text-white flex items-center justify-center rounded-xl shadow-2xl">
                        <Zap className="h-7 w-7" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-foreground m-0 italic tracking-tighter">Inbound Data Protocol</h2>
                        <p className="text-[10px] text-muted uppercase font-black tracking-[0.3em] mt-1.5">Step 01 / Identity Verification</p>
                     </div>
                  </div>
                  <button onClick={() => setIsProvisioning(false)} className="h-10 w-10 flex items-center justify-center hover:bg-white rounded-full transition-all text-xl font-light">&times;</button>
               </div>

               <div className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-foreground">Cloud Provider Shard</label>
                        <select className="input-enterprise h-12 w-full bg-surface-alt font-black text-[12px] appearance-none cursor-pointer">
                           <option>US-EAST-1 (N. VIRGINIA)</option>
                           <option>US-WEST-2 (OREGON)</option>
                           <option>EU-CENTRAL-1 (FRANKFURT)</option>
                        </select>
                     </div>
                     <div className="space-y-2.5">
                        <label className="text-[11px] font-black uppercase tracking-widest text-foreground">Logic Stream Key</label>
                        <div className="relative h-12">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                           <input type="password" placeholder="arn:shards:iam::matrix" className="input-enterprise pl-12 h-12 w-full text-[12px] font-mono" />
                        </div>
                     </div>
                  </div>

                  <div className="p-6 bg-surface-alt border-2 border-border-strong rounded-xl flex items-start gap-5 shadow-inner">
                     <ShieldCheck className="h-6 w-6 text-foreground shrink-0 mt-0.5" />
                     <p className="text-[12px] font-bold leading-relaxed text-secondary italic">
                       Protocol requires read-only administrative access for telemetry replication. Keys are encrypted via hardware-level KMS modules and never stored in plane-text shards.
                     </p>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4">
                     <button onClick={() => setIsProvisioning(false)} className="btn-ghost h-12 px-8 font-black uppercase tracking-widest text-[11px]">Abort Sync</button>
                     <button className="h-12 px-10 bg-black text-white rounded-lg font-black uppercase tracking-[0.2em] italic shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center">
                        Secure Sync <ArrowRight className="h-4 w-4 ml-3" />
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
