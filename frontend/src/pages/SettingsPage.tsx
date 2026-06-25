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

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { toast } from 'sonner'

const SettingsPage: React.FC = () => {
  const [isAuditModalOpen, setIsAuditModalOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'GENERAL' | 'USERS' | 'INTEGRATIONS'>('GENERAL')
  
  const { data: globalSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => apiClient.getSettings()
  })

  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
    enabled: activeTab === 'USERS'
  })

  const { data: auditLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiClient.getAuditLogs(),
    enabled: isAuditModalOpen
  })

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.updateSettings({ 
        "security_policy": "ENFORCED", 
        "retention_period": "90d",
        "api_endpoint": "https://api.opsmind.io"
      });
      toast.success('Platform preferences persisted.');
      refetchSettings();
    } catch (err) {
      toast.error('Failed to update system state.');
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this user access?')) return;
    try {
      await apiClient.deleteUser(id);
      toast.success('User privileges revoked.');
      refetchUsers();
    } catch (err) {
      toast.error('Failed to modify user state.');
    }
  }

  return (
    <div className="max-w-5xl mx-auto main-content-grid page-transition-fade pb-20">
      <div className="flex flex-col gap-1.5 pb-2 border-b border-border mb-8">
        <h1 className="text-page-title">Platform Configuration</h1>
        <div className="flex items-center gap-4 mt-1">
           {['GENERAL', 'USERS', 'INTEGRATIONS'].map(t => (
             <button 
               key={t} 
               onClick={() => setActiveTab(t as any)}
               className={cn(
                 "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all",
                 activeTab === t ? "bg-primary text-white" : "text-muted hover:bg-slate-100"
               )}>
               {t}
             </button>
           ))}
        </div>
      </div>

      <div className="grid gap-10">
        {activeTab === 'GENERAL' && (
          <>
            {/* Profile Card */}
            <section className="space-y-4">
              <h3 className="text-section-title flex items-center gap-2 px-1">
                <User className="h-3.5 w-3.5 text-accent" /> Identity & Access
              </h3>
              <div className="enterprise-card p-6">
                <div className="flex items-center gap-8">
                  <div className="h-16 w-16 rounded-sm bg-slate-100 border border-border flex items-center justify-center text-xl font-bold text-primary shadow-inner">
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
                             <span className="px-1.5 py-0.5 bg-blue-50 text-accent border border-blue-100 rounded-sm text-[9px] font-bold uppercase">L-4</span>
                          </div>
                       </div>
                    </div>
                    <div className="mt-4 flex gap-6">
                       <button className="text-[11px] font-bold text-accent hover:underline uppercase tracking-wider">Update Credentials</button>
                       <button 
                         onClick={() => setIsAuditModalOpen(true)}
                         className="text-[11px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-wider">
                         Audit History
                       </button>
                    </div>
                  </div>
                </div>
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
                       <span className="text-secondary truncate mr-4">ops_live_{globalSettings?.["api_key_suffix"] || "********************************421a"}</span>
                       <button className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Reveal</button>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-border flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <Lock className="h-4 w-4 text-muted" />
                       <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Storage Encryption: {globalSettings?.["encryption_standard"] || "AES-256-GCM enforced"}</span>
                    </div>
                    <button 
                      onClick={handleSaveSettings}
                      className="btn-primary h-9 px-6 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                      <Save className="h-3.5 w-3.5" /> Commit Changes
                    </button>
                 </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'USERS' && (
          <section className="space-y-4">
            <h3 className="text-section-title flex items-center gap-2 px-1">
              <User className="h-3.5 w-3.5 text-accent" /> User Management
            </h3>
            <div className="enterprise-table-container">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Operator</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user: any) => (
                    <tr key={user.id}>
                      <td className="text-[13px] font-bold text-primary">{user.firstName} {user.lastName}</td>
                      <td className="text-[11px] font-medium text-muted">{user.email}</td>
                      <td><span className="text-[10px] font-bold text-secondary uppercase">{user.role}</span></td>
                      <td>
                        <span className="status-badge badge-success text-[9px]">{user.status}</span>
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-critical hover:underline text-[10px] font-bold uppercase tracking-widest">Revoke</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'INTEGRATIONS' && (
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
        )}
      </div>

      {/* Audit Log Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-primary/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border w-full max-w-4xl rounded shadow-2xl flex flex-col max-h-[80vh]">
            <div className="px-5 py-3 border-b border-border bg-slate-50 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Platform Audit History</h2>
              <button onClick={() => setIsAuditModalOpen(false)} className="text-muted hover:text-critical transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
              <table className="enterprise-table">
                 <thead>
                    <tr>
                       <th className="w-32">Module</th>
                       <th className="w-48">Action</th>
                       <th>Details</th>
                       <th className="w-40">Timestamp</th>
                    </tr>
                 </thead>
                 <tbody>
                    {isLoadingLogs ? (
                      <tr><td colSpan={4} className="py-20 text-center animate-pulse text-muted font-bold text-[10px] uppercase tracking-widest">Hydrating Log Stream...</td></tr>
                    ) : auditLogs?.length === 0 ? (
                      <tr><td colSpan={4} className="py-20 text-center text-muted font-bold text-[10px] uppercase tracking-widest">Zero activities recorded in current epoch</td></tr>
                    ) : auditLogs?.map((log: any) => (
                      <tr key={log.id}>
                        <td><span className="px-1.5 py-0.5 bg-slate-100 text-secondary border border-border rounded-sm text-[9px] font-bold uppercase tracking-wider">{log.module}</span></td>
                        <td className="text-[12px] font-bold text-primary">{log.action}</td>
                        <td className="text-[11px] text-muted font-medium">{log.details}</td>
                        <td className="text-[11px] font-medium text-muted font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
