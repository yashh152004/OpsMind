import React from 'react'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Key, 
  Globe, 
  Moon,
  Github,
  Slack,
  Webhook
} from 'lucide-react'
import { cn } from '@/utils/cn'

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-outfit">Platform Settings</h1>
        <p className="text-muted-foreground">Configure your OpsMind environment and team preferences.</p>
      </div>

      <div className="grid gap-10">
        {/* Profile Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
            <User className="h-4 w-4" /> Account Information
          </div>
          <div className="glass-card p-8">
            <div className="flex items-center gap-8">
              <div className="h-24 w-24 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-3xl font-bold text-primary shadow-2xl">
                YK
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</div>
                      <div className="font-bold text-lg">Yash Kumar</div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">Role</div>
                      <div className="font-bold text-lg">Lead SRE Engineer</div>
                   </div>
                </div>
                <button className="text-sm font-bold text-primary hover:underline">Edit Profile Artifacts</button>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-orange-500">
            <Bell className="h-4 w-4" /> Alert Routing
          </div>
          <div className="glass-card divide-y divide-white/5">
             {[
               { icon: Slack, name: "Slack Integration", desc: "Route S1/S2 incidents to #ops-war-room", connected: true },
               { icon: Webhook, name: "PagerDuty Sync", desc: "Automated escalation for nighttime criticals", connected: true },
               { icon: Globe, name: "Webhooks", desc: "Send raw alert data to custom endpoints", connected: false },
             ].map(item => (
               <div key={item.name} className="p-6 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                        <item.icon className="h-5 w-5" />
                     </div>
                     <div>
                        <div className="font-bold">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn("text-[10px] font-bold px-2 py-0.5 rounded", item.connected ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-muted-foreground")}>
                       {item.connected ? "CONNECTED" : "DISCONNECTED"}
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline">Configure</button>
                  </div>
               </div>
             ))}
          </div>
        </section>

        {/* Security */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-purple-500">
            <Shield className="h-4 w-4" /> Security & Keys
          </div>
          <div className="glass-card p-8 space-y-6">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="font-bold">API Access Tokens</div>
                   <button className="btn-primary py-1.5 px-4 text-xs">Generate New Key</button>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl font-mono text-xs flex items-center justify-between">
                   <span>ops_live_tk_**************************421a</span>
                   <span className="text-muted-foreground cursor-pointer hover:text-white">Copy</span>
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SettingsPage
