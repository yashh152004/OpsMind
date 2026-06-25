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
  Lock
} from 'lucide-react'
import { cn } from '@/utils/cn'

const categories = ["Cloud Platforms", "Metrics & Logs", "Messaging", "Security"]

const integrations = [
  { id: 1, name: "Prometheus", source: "Metrics", icon: Activity, connected: true, health: "HEALTHY", lastSync: "2m ago" },
  { id: 2, name: "AWS CloudWatch", source: "Cloud", icon: Cloud, connected: true, health: "HEALTHY", lastSync: "5m ago" },
  { id: 3, name: "Elasticsearch", source: "Logs", icon: Database, connected: false, health: "NONE", lastSync: "Never" },
  { id: 4, name: "Azure Monitor", source: "Cloud", icon: Cloud, connected: false, health: "NONE", lastSync: "Never" },
]

const IntegrationsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Sources")
  const [isProvisioning, setIsProvisioning] = useState(false)

  return (
    <div className="space-y-8 page-transition pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Sensor Connectors</h1>
          <p className="text-muted-foreground text-sm font-medium">Provision and monitor high-cardinality data sinks.</p>
        </div>
        <button 
          onClick={() => setIsProvisioning(true)}
          className="btn-primary h-10 px-6 text-sm"
        >
           <Plus className="h-4 w-4" />
           Establish Connection
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
         {["All Sources", ...categories].map(cat => (
           <button 
             key={cat}
             onClick={() => setSelectedCategory(cat)}
             className={cn(
               "pb-3 text-xs font-bold uppercase tracking-widest transition-colors relative",
               selectedCategory === cat ? "text-primary" : "text-muted-foreground hover:text-foreground"
             )}
           >
             {cat}
             {selectedCategory === cat && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
           </button>
         ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {integrations.map((app) => (
          <div key={app.id} className="enterprise-card group enterprise-card-hover flex flex-col">
            <div className="p-6 flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded bg-accent border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <app.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
                {app.connected ? (
                   <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                ) : (
                   <div className="h-2 w-2 rounded-full bg-muted" />
                )}
              </div>
              
              <div>
                 <h3 className="font-bold">{app.name}</h3>
                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{app.source}</p>
              </div>

              {app.connected ? (
                 <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground">
                       <span>Status</span>
                       <span className="text-emerald-500">{app.health}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground mt-1">
                       <span>Heartbeat</span>
                       <span>{app.lastSync}</span>
                    </div>
                 </div>
              ) : (
                 <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">Configuration required to establish data stream.</p>
              )}
            </div>

            <div className="p-3 bg-accent/20 border-t border-border flex items-center justify-between">
               <button className="text-[10px] font-bold text-primary hover:underline">Documentation</button>
               {app.connected ? (
                  <div className="flex gap-2">
                    <button className="btn-ghost p-1.5"><RefreshCw className="h-3 w-3" /></button>
                    <button className="btn-ghost p-1.5 text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
               ) : (
                  <button className="btn-primary h-7 px-3 text-[10px] font-bold">Configure</button>
               )}
            </div>
          </div>
        ))}

        {/* Custom Connector Card */}
        <div className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 transition-colors cursor-pointer group">
           <div className="h-12 w-12 rounded-full bg-accent border border-border flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Terminal className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
           </div>
           <div>
              <h4 className="font-bold text-sm">Custom gRPC Connector</h4>
              <p className="text-[10px] text-muted-foreground px-4">Listen for raw protobuf streams from internal services.</p>
           </div>
        </div>
      </div>

      {/* Connection Wizard Modal Simulation */}
      {isProvisioning && (
         <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="enterprise-card max-w-xl w-full p-8 space-y-8 animate-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded">
                        <Cloud className="h-6 w-6 text-primary" />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold font-outfit">Cloud Sink Wizard</h2>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Step 1: Identity & Authorization</p>
                     </div>
                  </div>
                  <button onClick={() => setIsProvisioning(false)} className="btn-ghost h-8 w-8">&times;</button>
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Provider Region</label>
                     <select className="input-field h-10 w-full bg-accent">
                        <option>us-east-1 (N. Virginia)</option>
                        <option>us-west-2 (Oregon)</option>
                        <option>eu-central-1 (Frankfurt)</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">IAM Role ARN / Access Key</label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input type="password" placeholder="arn:aws:iam::123456789:role/OpsCenterAudit" className="input-field pl-10 h-10" />
                     </div>
                  </div>
               </div>

               <div className="p-4 bg-primary/5 border border-primary/20 rounded-md flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="text-[10px] font-medium leading-relaxed">
                    OpsMind requires 'ReadOnly' permissions for telemetry ingestion. Your keys are encrypted via KMS and never stored in plaintext within the node cluster.
                  </p>
               </div>

               <div className="flex items-center justify-end gap-3 pt-4">
                  <button onClick={() => setIsProvisioning(false)} className="btn-secondary h-10 px-6 text-xs">Cancel</button>
                  <button className="btn-primary h-10 px-6 text-xs">
                     Begin Validation <ArrowRight className="h-4 w-4" />
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

export default IntegrationsPage
