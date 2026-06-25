import React from 'react'
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Slack,
  Webhook,
  Lock,
  ChevronRight,
  Save,
  X,
  Eye
} from 'lucide-react'
import { cn } from '@/utils/cn'

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto main-content-grid page-transition-fade pb-20">
      <div className="flex flex-col gap-1.5 pb-2 border-b border-border mb-8">
        <h1 className="text-page-title">Platform Configuration</h1>
        <p className="text-helper font-medium">Manage your organizational identity, global integrations, and security protocols.</p>
      </div>

      <div className="grid gap-10">
        {/* Profile Card */}
        <section className="space-y-4">
          <h3 className="text-section-title flex items-center gap-2 px-1">
            <User className="h-3.5 w-3.5 text-accent" /> Identity & Access
          </h3>
          <div className="enterprise-card p-6">
            <div className="flex items-center gap-8">
              <div className="h-16 w-16 rounded-sm bg-slate-100 border border-border flex items-center justify-center text-xl font-bold text-primary">
                YK
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-muted tracking-widest">Operator Name</div>
                      <div className="text-sm font-bold text-primary">Yash Kumar</div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-muted tracking-widest">Assigned Role</div>
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-bold text-primary">Cluster Admin</span>
                         <span className="px-1.5 py-0.5 bg-blue-50 text-accent border border-blue-100 rounded-sm text-[9px] font-bold">L-4</span>
                      </div>
                   </div>
                </div>
                <div className="mt-4 flex gap-6">
                   <button className="text-[11px] font-bold text-accent hover:underline uppercase tracking-wider">Update Credentials</button>
                   <button className="text-[11px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-wider">Audit History</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Integrations */}
        <section className="space-y-4">
          <h3 className="text-section-title flex items-center gap-2 px-1">
            <Bell className="h-3.5 w-3.5 text-warning" /> External Integrations
          </h3>
          <div className="enterprise-table-container">
             <table className="enterprise-table">
                <tbody>
                   {[
                     { icon: Slack, name: "Slack Integration", desc: "Route incidents to #ops-war-room", connected: true },
                     { icon: Webhook, name: "PagerDuty Gateway", desc: "Automated escalation on P1 threshold", connected: true },
                     { icon: Globe, name: "Internal Webhooks", desc: "Push telemetry to gRPC sink", connected: false },
                   ].map(item => (
                     <tr key={item.name} className="group">
                        <td className="w-12">
                           <div className="h-9 w-9 rounded-sm bg-slate-50 border border-border flex items-center justify-center text-muted">
                              <item.icon className="h-4.5 w-4.5" />
                           </div>
                        </td>
                        <td>
                           <div className="text-[13px] font-bold text-primary">{item.name}</div>
                           <div className="text-[11px] text-muted font-medium">{item.desc}</div>
                        </td>
                        <td className="w-24">
                           <span className={cn(
                              "status-badge",
                              item.connected ? "badge-success" : "bg-slate-100 text-muted border-border"
                           )}>
                              {item.connected ? "Active" : "Disabled"}
                           </span>
                        </td>
                        <td className="w-12 text-right">
                           <button className="btn-ghost" title="Configure"><ChevronRight className="h-4 w-4" /></button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </section>

        {/* Security Subsystem */}
        <section className="space-y-4">
          <h3 className="text-section-title flex items-center gap-2 px-1">
            <Shield className="h-3.5 w-3.5 text-critical" /> Security Protocols
          </h3>
          <div className="enterprise-card p-6 space-y-8">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                      <div className="text-[13px] font-bold text-primary">API Developer Keychain</div>
                      <div className="text-[11px] text-muted font-medium">Authentication key for programmatic CLI and API orchestration.</div>
                   </div>
                   <button className="btn-secondary h-8 text-[11px] font-bold px-4 uppercase tracking-wider">Rotate Key</button>
                </div>
                <div className="p-3 bg-slate-50 border border-border rounded-sm font-mono text-[11px] flex items-center justify-between group">
                   <span className="text-secondary truncate mr-4">ops_live_********************************421a</span>
                   <button className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Reveal</button>
                </div>
             </div>

             <div className="pt-6 border-t border-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <Lock className="h-4 w-4 text-muted" />
                   <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Storage Encryption: AES-256-GCM enforced</span>
                </div>
                <button className="btn-primary h-9 px-6 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                  <Save className="h-3.5 w-3.5" /> Commit Changes
                </button>
             </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SettingsPage
