import React from 'react'
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Slack,
  Webhook,
  Database,
  Lock,
  ChevronRight,
  ExternalLink,
  Save
} from 'lucide-react'
import { cn } from '@/utils/cn'

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 page-transition">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold font-outfit">Console Configuration</h1>
        <p className="text-muted-foreground text-sm font-medium">Manage your organization's cluster, integrations, and SRE identities.</p>
      </div>

      <div className="grid gap-12">
        {/* Profile Card */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
            <User className="h-3.5 w-3.5" /> Identity & Profile
          </div>
          <div className="enterprise-card p-6">
            <div className="flex items-center gap-8">
              <div className="h-20 w-20 rounded bg-accent border border-border flex items-center justify-center text-2xl font-bold text-primary group cursor-pointer hover:border-primary transition-colors">
                YK
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-1">
                      <div className="text-[9px] uppercase font-bold text-muted-foreground">Operator Name</div>
                      <div className="font-bold">Yash Kumar</div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-[9px] uppercase font-bold text-muted-foreground">Assigned Role</div>
                      <div className="font-bold flex items-center gap-2">
                         Cluster Admin <span className="status-badge badge-info">Level 4</span>
                      </div>
                   </div>
                </div>
                <div className="mt-4 flex gap-4">
                   <button className="text-xs font-bold text-primary hover:underline">Change Key</button>
                   <button className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">Audit Logs</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Integrations */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-orange-500">
            <Bell className="h-3.5 w-3.5" /> Signal Sink Routing
          </div>
          <div className="enterprise-card divide-y divide-border overflow-hidden">
             {[
               { icon: Slack, name: "Slack Integration", desc: "Route S1/S2 incidents to #noc-war-room", connected: true },
               { icon: Webhook, name: "PagerDuty Gateway", desc: "Automated escalation on P1 threshold", connected: true },
               { icon: Globe, name: "Internal Webhooks", desc: "Push raw telemetry to custom gRPC sink", connected: false },
             ].map(item => (
               <div key={item.name} className="p-5 flex items-center justify-between hover:bg-accent/10 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded bg-accent border border-border flex items-center justify-center text-muted-foreground">
                        <item.icon className="h-5 w-5" />
                     </div>
                     <div>
                        <div className="text-sm font-bold">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground font-medium">{item.desc}</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                       "status-badge",
                       item.connected ? "badge-success" : "bg-accent text-muted-foreground border-border"
                    )}>
                       {item.connected ? "ACTIVE" : "DISABLED"}
                    </div>
                    <button className="btn-ghost p-1.5"><ChevronRight className="h-4 w-4" /></button>
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* Security & Access */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-500">
            <Shield className="h-3.5 w-3.5" /> Security Subsystem
          </div>
          <div className="enterprise-card p-6 space-y-8">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                      <div className="text-sm font-bold">API Access Key</div>
                      <div className="text-[10px] text-muted-foreground">Used for programmatic access to the OpsMind CLI.</div>
                   </div>
                   <button className="btn-secondary h-8 text-[10px] font-bold px-3">Rotate Key</button>
                </div>
                <div className="p-3 bg-background border border-border rounded font-mono text-[11px] flex items-center justify-between group">
                   <span className="text-primary truncate mr-4">ops_live_********************************421a</span>
                   <button className="text-[10px] font-bold text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100">Reveal Key</button>
                </div>
             </div>

             <div className="pt-6 border-t border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <Lock className="h-4 w-4 text-muted-foreground" />
                   <span className="text-[11px] font-medium text-muted-foreground">Node encryption: AES-256-GCM enforced.</span>
                </div>
                <button className="btn-primary h-9 px-6 text-xs">
                  <Save className="h-3.5 w-3.5 mr-2" />
                  Commit Changes
                </button>
             </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SettingsPage
