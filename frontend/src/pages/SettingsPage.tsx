import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  User, Shield, Globe, MessageSquare, Webhook, Lock, ChevronRight, Camera,
  Mail, Phone, Briefcase, History, AlertTriangle, LogOut, Building,
  Plus, Eye, EyeOff, Key, Terminal, CreditCard, Bell, Layout, Settings as SettingsIcon, ShieldCheck, Download
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { apiClient } from '@/services/api'
import { toast } from 'sonner'
import { useAuth } from '@/hooks'

type SettingsTab = 'PROFILE' | 'ORGANIZATION' | 'INTEGRATIONS' | 'SECURITY' | 'AUDIT'

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('PROFILE')
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    title: user?.title || '',
    department: user?.department || '',
    phone: user?.phone || '',
    timezone: user?.timezone || 'UTC',
    language: user?.language || 'en',
    avatarUrl: user?.avatarUrl || ''
  })
  const [apiKeyVisible, setApiKeyVisible] = useState(false)

  React.useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        title: user.title || '',
        department: user.department || '',
        phone: user.phone || '',
        timezone: user.timezone || 'UTC',
        language: user.language || 'en',
        avatarUrl: user.avatarUrl || ''
      })
    }
  }, [user])

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
    enabled: activeTab === 'ORGANIZATION'
  })

  const { data: auditLogs, isLoading: isAuditLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiClient.getAuditLogs(),
    enabled: activeTab === 'AUDIT'
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateProfile(data),
    onSuccess: () => {
      toast.success('PRO_ID_SYNC: Profile credentials updated on cloud shard.')
      queryClient.invalidateQueries({ queryKey: ['user', 'current'] })
    },
    onError: () => toast.error('PRO_FAULT: Profile synchronization failure.')
  })

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const toastId = toast.loading('UPLOADING_ASSET...')
    try {
      const result = await apiClient.uploadFile(file)
      setProfileForm(prev => ({ ...prev, avatarUrl: result.url }))
      toast.success('ASSET_SYNCED', { id: toastId })
    } catch (err) {
      toast.error('UPLOAD_FAULT', { id: toastId })
    }
  }

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'PROFILE', label: 'Identity', icon: User },
    { id: 'ORGANIZATION', label: 'Workspace', icon: Building },
    { id: 'INTEGRATIONS', label: 'Connectors', icon: Webhook },
    { id: 'SECURITY', label: 'Encryption', icon: Lock },
    { id: 'AUDIT', label: 'Audit Log', icon: History },
  ]

  return (
    <div className="page-transition-fade space-y-12 p-10 bg-white min-h-screen">
      {/* Settings Orchestration Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tighter text-black m-0 font-geist">Settings</h1>
           <div className="flex items-center gap-4">
              <p className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                 <SettingsIcon className="h-4 w-4 text-black" /> Configuration & Policy Matrix
              </p>
              <div className="h-4 w-[1px] bg-border" />
              <p className="text-[10px] font-bold text-black uppercase tracking-widest">Global Admin: active</p>
           </div>
        </div>
        <button 
          onClick={() => logout()}
          className="btn-secondary h-10 border-strong text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
        >
           <LogOut className="h-4 w-4" />
           <span className="ml-2">Terminate Session</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Rail */}
        <aside className="w-full lg:w-64 shrink-0 space-y-1">
           <div className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-4 pl-3">Navigation Shards</div>
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "w-full flex items-center gap-3 px-4 py-3 rounded text-[13px] font-bold transition-all border",
                 activeTab === tab.id 
                   ? "bg-black text-white border-black shadow-xl" 
                   : "text-muted hover:bg-surface-alt hover:text-black border-transparent"
               )}
             >
               <tab.icon className="h-4 w-4" />
               {tab.label}
             </button>
           ))}
        </aside>

        {/* Configuration Surface */}
        <main className="flex-1">
          <div className="enterprise-card bg-white border-strong min-h-[640px]">
             <div className="p-10">
                {activeTab === 'PROFILE' && (
                  <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(profileForm); }} className="space-y-12">
                    <div className="flex items-start justify-between">
                       <div className="space-y-1">
                          <h2 className="text-2xl font-black text-black font-geist uppercase border-none mb-0 pb-0">Identity Credentials</h2>
                          <p className="text-[12px] text-muted font-medium italic">Synchronize your personal operational profile across the mesh.</p>
                       </div>
                       <button type="submit" className="btn-primary h-10 px-8 shadow-xl shadow-black/10">
                          {updateProfileMutation.isPending ? 'Syncing...' : 'Sync Profile'}
                       </button>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-16">
                       <div className="flex flex-col items-center gap-4 shrink-0">
                          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                             <div className="h-28 w-28 rounded-none border border-black overflow-hidden flex items-center justify-center bg-surface-alt shadow-[10px_10px_0px_rgba(0,0,0,0.05)] relative group-hover:scale-95 transition-transform">
                                {profileForm.avatarUrl ? (
                                    <img src={profileForm.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-black/10">{(profileForm.firstName[0] || '') + (profileForm.lastName[0] || '')}</span>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <Camera className="h-6 w-6 text-white" />
                                </div>
                             </div>
                          </div>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">JPG/PNG MAX 2MB</p>
                       </div>

                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            <div className="space-y-2">
                                <label className="form-label">Operational FirstName</label>
                                <input className="input-field border-strong h-11" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label">Operational LastName</label>
                                <input className="input-field border-strong h-11" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label">Logic Shard Title</label>
                                <input className="input-field border-strong h-11" placeholder="e.g. SRE Lead" value={profileForm.title} onChange={e => setProfileForm({...profileForm, title: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label">Operational Shard</label>
                                <input className="input-field border-strong h-11" placeholder="e.g. CORE_PLATFORM" value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label">Secure Phonenumber</label>
                                <input className="input-field border-strong h-11 italic" placeholder="+1 (555) 000-0000" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="form-label">Primary Signal Email</label>
                                <input disabled className="input-field border-strong bg-surface-alt/50 text-muted italic h-11 cursor-not-allowed" value={user?.email || ''} />
                            </div>
                       </div>
                    </div>
                  </form>
                )}

                {activeTab === 'ORGANIZATION' && (
                  <div className="space-y-12">
                     <div className="space-y-1">
                        <h2 className="text-2xl font-black text-black font-geist uppercase border-none mb-0 pb-0">Workspace Control</h2>
                        <p className="text-[12px] text-muted font-medium italic">Manage engineering squads and platform access policies.</p>
                     </div>

                     <div className="space-y-8">
                        <div className="flex items-center justify-between border-b-2 border-black pb-4">
                           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black m-0 border-none pb-0">Squad Integrity Matrix</h3>
                           <button className="h-8 px-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90">Add Member</button>
                        </div>
                        <div className="enterprise-table-container border-strong">
                             <table className="enterprise-table">
                                 <thead>
                                     <tr>
                                         <th>Squad Member</th>
                                         <th>Security Rank</th>
                                         <th>State</th>
                                         <th className="text-right pr-4">Logic</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {isUsersLoading ? (
                                        Array(5).fill(0).map((_, i) => (
                                          <tr key={i}><td colSpan={4} className="py-8"><div className="h-6 skeleton w-full" /></td></tr>
                                        ))
                                     ) : (users as any[])?.map(u => (
                                         <tr key={u.email} className="group hover:bg-surface-alt/50">
                                             <td className="py-4">
                                                <div className="flex flex-col">
                                                   <span className="text-[13px] font-black text-black">{u.firstName} {u.lastName}</span>
                                                   <span className="text-[10px] font-medium text-muted normal-case italic">{u.email}</span>
                                                </div>
                                             </td>
                                             <td><span className="font-mono text-[11px] font-black uppercase">{u.role}</span></td>
                                             <td><span className="status-badge badge-success">{u.status}</span></td>
                                             <td className="text-right pr-4">
                                                 <button className="text-red-600 hover:underline font-black uppercase tracking-widest text-[9px]">Revoke_Access</button>
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'INTEGRATIONS' && (
                  <div className="space-y-12">
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-black text-black font-geist uppercase border-none mb-0 pb-0">Signal Connectors</h2>
                           <p className="text-[12px] text-muted font-medium italic">Bridge OpsMind mesh with global engineering toolchains.</p>
                        </div>
                        <button className="btn-primary h-10 shadow-xl shadow-black/10">
                           <Plus className="h-4 w-4 mr-2" /> Provision Link
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                          { id: 'slack', name: 'Slack_HQ', icon: MessageSquare, desc: 'Signal propagation to #ops-war-room', status: 'ACTIVE' },
                          { id: 'pd', name: 'Pager_Duty', icon: Shield, desc: 'Critical tier escalation logic', status: 'ALERT' },
                          { id: 'webhook', name: 'Custom_Sink', icon: Globe, desc: 'Enterprise gRPC telemetry sink', status: 'NOMINAL' },
                          { id: 'teams', name: 'MS_Teams', icon: Mail, desc: 'Organization collab synchronization', status: 'OFFLINE' },
                        ].map(int => (
                          <div key={int.id} className="p-6 border border-strong rounded shadow-sm hover:border-black transition-all group cursor-pointer flex items-center justify-between">
                             <div className="flex items-center gap-5">
                                <div className="h-12 w-12 bg-black text-white rounded flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                   <int.icon className="h-6 w-6" />
                                </div>
                                <div className="space-y-0.5">
                                   <div className="text-[14px] font-black text-black uppercase tracking-widest">{int.name}</div>
                                   <div className="text-[11px] text-muted font-medium leading-tight">{int.desc}</div>
                                 </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <span className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  int.status === 'ACTIVE' ? "bg-emerald-500 animate-pulse" : int.status === 'ALERT' ? "bg-red-500 animate-pulse" : "bg-neutral-200"
                                )} />
                                <ChevronRight className="h-4 w-4 text-muted group-hover:text-black group-hover:translate-x-1 transition-all" />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                {activeTab === 'SECURITY' && (
                  <div className="space-y-12">
                     <div className="space-y-1">
                        <h2 className="text-2xl font-black text-black font-geist uppercase border-none mb-0 pb-0">Secure Loop Logic</h2>
                        <p className="text-[12px] text-muted font-medium italic">Manage encryption protocols and cryptographic signal keys.</p>
                     </div>

                      <div className="space-y-10">
                         <section className="space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted border-b border-border pb-3">Global Command API Key</h3>
                            <div className="p-8 border border-black bg-surface-alt/30 space-y-6 relative overflow-hidden group">
                               <div className="flex items-center justify-between relative z-10">
                                  <div className="font-mono text-lg font-black text-black tracking-tighter">
                                     {apiKeyVisible ? 'ops_live_948a_29x8_v12_z7' : 'ops_live_948a********************b12z'}
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <button onClick={() => setApiKeyVisible(!apiKeyVisible)} className="btn-secondary h-9 border-strong text-[10px]">
                                        {apiKeyVisible ? <><EyeOff className="h-3.5 w-3.5 mr-2" /> Hide</> : <><Eye className="h-3.5 w-3.5 mr-2" /> Reveal</>}
                                     </button>
                                     <button 
                                       onClick={() => { navigator.clipboard.writeText('ops_live_948a_29x8_v12_z7'); toast.success('API Key synced to clipboard.'); }}
                                       className="btn-primary h-9 px-6 text-[10px]">Copy Logic</button>
                                  </div>
                                </div>
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                                   <AlertTriangle className="h-4 w-4" /> Security Violation Warning: Keys must never reside in client runtime buffers.
                                </p>
                            </div>
                         </section>

                         <section className="space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted border-b border-border pb-3">Operational 2FA Control</h3>
                            <div className="flex items-center justify-between p-8 border border-strong rounded bg-white hover:border-black transition-all group">
                               <div className="flex items-center gap-6">
                                  <div className="h-12 w-12 bg-black text-white rounded flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                     <ShieldCheck className="h-6 w-6" />
                                  </div>
                                  <div className="space-y-1">
                                     <div className="text-[14px] font-black text-black uppercase tracking-widest">Mobile SRE Authenticator</div>
                                     <div className="text-[11px] text-muted font-medium italic">Enforce multi-factor verification on all critical signal remediations.</div>
                                  </div>
                               </div>
                               <button className="btn-primary bg-emerald-600 border-none h-10 px-8 text-[11px] hover:bg-emerald-700 shadow-xl shadow-emerald-100">Provision 2FA</button>
                            </div>
                         </section>
                      </div>
                  </div>
                )}

                {activeTab === 'AUDIT' && (
                  <div className="space-y-8">
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-black text-black font-geist uppercase border-none mb-0 pb-0">Operational Audit Log</h2>
                           <p className="text-[12px] text-muted font-medium italic">A sequential, non-repudiable record of all administrative operations.</p>
                        </div>
                        <button className="btn-secondary h-10 border-strong">
                           <Download className="h-4 w-4" />
                           <span className="ml-2">Export CSV</span>
                        </button>
                     </div>

                     <div className="enterprise-table-container border-strong shadow-2xl shadow-black/5">
                        <table className="enterprise-table">
                           <thead>
                              <tr>
                                 <th className="w-40">Action Shard</th>
                                 <th className="w-32">Module Identity</th>
                                 <th>Narrative & Context</th>
                                 <th className="w-48 text-right pr-4">Precision Timestamp</th>
                              </tr>
                           </thead>
                           <tbody>
                              {isAuditLoading ? (
                                 Array(10).fill(0).map((_, i) => (
                                   <tr key={i}><td colSpan={4} className="py-8"><div className="h-6 skeleton w-full" /></td></tr>
                                 ))
                              ) : (auditLogs as any[])?.map((log: any) => (
                                <tr key={log.id} className="group hover:bg-surface-alt/50">
                                   <td className="font-black text-black uppercase tracking-widest italic">{log.action}</td>
                                   <td><span className="text-[10px] font-black uppercase tracking-widest text-muted border border-border-strong px-2 py-0.5 rounded">{log.module}</span></td>
                                   <td className="font-medium text-black pr-10">{log.details}</td>
                                   <td className="font-mono text-[11px] font-black text-black/40 text-right pr-4">{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SettingsPage
