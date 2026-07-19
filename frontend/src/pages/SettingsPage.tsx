import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  User, Building, Webhook, Lock, ChevronRight, Camera,
  LogOut, Settings as SettingsIcon, ShieldCheck, Download,
  RefreshCw, Globe, Plus, History
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { apiClient } from '@/services/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth'

type SettingsTab = 'PROFILE' | 'WORKSPACE' | 'CONNECTORS' | 'SECURITY' | 'AUDIT'

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('PROFILE')
  const { user, setUser, logout } = useAuthStore()
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

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [workspaceForm, setWorkspaceForm] = useState({
    name: '',
    slug: '',
    description: '',
    website: ''
  })

  // Queries
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ['workspace-users'],
    queryFn: () => apiClient.getUsers(),
    enabled: activeTab === 'WORKSPACE'
  })

  const { data: organization } = useQuery({
    queryKey: ['my-organization'],
    queryFn: () => apiClient.getOrganization(),
    enabled: activeTab === 'WORKSPACE'
  })

  const { data: auditLogs, isLoading: isAuditLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiClient.getAuditLogs(),
    enabled: activeTab === 'AUDIT'
  })

  const { data: integrations, isLoading: isIntegrationsLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => apiClient.getIntegrations(),
    enabled: activeTab === 'CONNECTORS'
  })

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      toast.success('Identity profile synchronized.')
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
    },
    onError: () => toast.error('Profile synchronization failure.')
  })

  const updateOrgMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateOrganization(data),
    onSuccess: () => {
      toast.success('Workspace policies updated.')
      queryClient.invalidateQueries({ queryKey: ['my-organization'] })
    },
    onError: () => toast.error('Organization update failed.')
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => apiClient.changePassword(data),
    onSuccess: () => {
      toast.success('Security credentials rotated.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Password rotation failed.')
  })

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const toastId = toast.loading('Uploading asset...')
    try {
      const result = await apiClient.uploadFile(file)
      setProfileForm(prev => ({ ...prev, avatarUrl: result.url }))
      updateProfileMutation.mutate({ ...profileForm, avatarUrl: result.url })
      toast.success('Profile image updated.', { id: toastId })
    } catch (err: any) {
      toast.error('Avatar upload failed.', { id: toastId })
    }
  }

  React.useEffect(() => {
    if (organization) {
      setWorkspaceForm({
        name: organization.name || '',
        slug: organization.slug || '',
        description: organization.description || '',
        website: organization.website || ''
      })
    }
  }, [organization])

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'PROFILE', label: 'Identity', icon: User },
    { id: 'WORKSPACE', label: 'Workspace', icon: Building },
    { id: 'CONNECTORS', label: 'Connectors', icon: Webhook },
    { id: 'SECURITY', label: 'Security', icon: Lock },
    { id: 'AUDIT', label: 'Audit Log', icon: History },
  ]

  return (
    <div className="page-transition-fade space-y-6 p-6 lg:p-8 bg-background min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-border">
        <div className="space-y-1 text-left">
           <h1 className="text-[32px] font-bold tracking-tight text-foreground m-0 leading-tight">Platform Settings</h1>
           <div className="flex items-center gap-2.5">
              <span className="badge-enterprise bg-surface-alt border border-border py-0.5">
                 <SettingsIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                 Global Configuration
              </span>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                 <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Administrative Access Verified
              </p>
           </div>
        </div>
        <button 
          onClick={() => logout()}
          className="btn-secondary h-8.5 text-red-500 hover:text-red-400 hover:border-red-500/25"
        >
           <LogOut className="h-4 w-4 mr-1.5" />
           <span>Sign Out</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Rail */}
        <aside className="w-full lg:w-60 shrink-0">
           <div className="flex flex-col gap-1 p-1 bg-surface-alt rounded-[var(--radius)] border border-border text-left">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2 rounded-[var(--radius)] text-[13px] font-semibold transition-all text-left",
                    activeTab === tab.id 
                      ? "bg-background text-foreground shadow-xs border border-border" 
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/50"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-foreground" : "text-muted-foreground")} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />}
                </button>
              ))}
           </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <div className="card-enterprise p-6 lg:p-8 overflow-hidden">
             <div className="max-w-3xl text-left">
                {activeTab === 'PROFILE' && (
                  <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(profileForm); }} className="space-y-6">
                    <div className="flex items-start justify-between">
                       <div className="space-y-1">
                          <h2 className="text-[18px] font-bold text-foreground">Identity Profile</h2>
                          <p className="text-[12px] text-muted-foreground font-normal">Synchronize your personal credentials across the platform.</p>
                       </div>
                       <button 
                         type="submit" 
                         disabled={updateProfileMutation.isPending}
                         className="btn-primary h-8.5 px-4"
                       >
                          {updateProfileMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save Profile'}
                       </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 pt-4">
                       <div className="flex flex-col items-center gap-3 shrink-0">
                          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                             <div className="h-20 w-20 rounded-2xl border border-border overflow-hidden bg-surface-alt flex items-center justify-center transition-all group-hover:border-border-strong">
                                {profileForm.avatarUrl ? (
                                    <img src={profileForm.avatarUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-6 w-6 text-muted-foreground" />
                                )}
                                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-background">
                                   <Camera className="h-4.5 w-4.5" />
                                </div>
                             </div>
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Change Photo</span>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                       </div>

                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                  <label className="label-enterprise">First Name</label>
                                  <input required className="input-enterprise h-9.5 font-medium" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="label-enterprise">Last Name</label>
                                  <input required className="input-enterprise h-9.5 font-medium" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="label-enterprise">Professional Title</label>
                                  <input className="input-enterprise h-9.5 font-medium" placeholder="e.g. Senior Site Reliability Engineer" value={profileForm.title} onChange={e => setProfileForm({...profileForm, title: e.target.value})} />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="label-enterprise">Department</label>
                                  <input className="input-enterprise h-9.5 font-medium" placeholder="e.g. Cloud Operations" value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})} />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="label-enterprise">Mobile / Dispatch Phone</label>
                                  <input className="input-enterprise h-9.5 font-medium" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                              </div>
                              <div className="space-y-1.5">
                                  <label className="label-enterprise">Login Email</label>
                                  <input disabled className="input-enterprise h-9.5 bg-surface-alt cursor-not-allowed opacity-100 font-medium italic text-muted-foreground" value={user?.email || ''} />
                              </div>
                       </div>
                    </div>
                  </form>
                )}

                {activeTab === 'WORKSPACE' && (
                  <div className="space-y-8">
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                           <h2 className="text-[18px] font-bold text-foreground">Workspace Configuration</h2>
                           <p className="text-[12px] text-muted-foreground font-normal">Manage organization-level parameters and squad access.</p>
                        </div>
                        <button 
                          onClick={() => updateOrgMutation.mutate(workspaceForm)}
                          disabled={updateOrgMutation.isPending}
                          className="btn-primary h-8.5 px-4"
                        >
                           {updateOrgMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-border">
                        <div className="space-y-1.5">
                           <label className="label-enterprise">Organization Name</label>
                           <input className="input-enterprise h-9.5 font-semibold" value={workspaceForm.name} onChange={e => setWorkspaceForm({...workspaceForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                           <label className="label-enterprise">Slug</label>
                           <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-mono text-sm shrink-0">opsmind.io/</span>
                              <input className="input-enterprise h-9.5 font-semibold w-full" value={workspaceForm.slug} onChange={e => setWorkspaceForm({...workspaceForm, slug: e.target.value})} />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                           <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground m-0">Squad Directory</h3>
                           <button className="btn-secondary h-8 px-2.5 text-[11px] font-semibold">Invite Member</button>
                        </div>
                        <div className="table-container">
                             <table className="table-enterprise">
                                 <thead>
                                     <tr>
                                         <th className="py-3">Operator</th>
                                         <th>Permission</th>
                                         <th className="text-center">Status</th>
                                         <th className="text-right">Actions</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {isUsersLoading ? (
                                        Array(3).fill(0).map((_, i) => (
                                          <tr key={i}><td colSpan={4} className="py-8"><div className="h-5 skeleton-ui w-full opacity-90 animate-pulse" /></td></tr>
                                        ))
                                     ) : (users as any[])?.map(u => (
                                         <tr key={u.email} className="group">
                                             <td className="py-3.5">
                                                <div className="flex items-center gap-3 text-left">
                                                   <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center text-[11px] font-semibold text-foreground shrink-0 leading-none">
                                                      {u.firstName[0]}{u.lastName[0]}
                                                   </div>
                                                    <div className="flex flex-col">
                                                       <span className="text-[13px] font-semibold text-foreground leading-tight">{u.firstName} {u.lastName}</span>
                                                       <span className="text-[11px] text-muted-foreground">{u.email}</span>
                                                    </div>
                                                </div>
                                             </td>
                                             <td><span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">{u.role}</span></td>
                                             <td className="text-center">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 italic">{u.status}</span>
                                             </td>
                                             <td className="text-right">
                                                 {u.email !== user?.email && (
                                                   <button 
                                                     onClick={() => { if(confirm('Revoke access?')) apiClient.revokeAccess(u.id); }}
                                                     className="text-red-500 hover:text-red-400 font-bold uppercase tracking-wider text-[10px] transition-all"
                                                   >
                                                      Revoke
                                                   </button>
                                                 )}
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'CONNECTORS' && (
                  <div className="space-y-6">
                     <div className="flex items-start justify-between pb-2">
                        <div className="space-y-1">
                           <h2 className="text-[18px] font-bold text-foreground">Ecosystem Connectors</h2>
                           <p className="text-[12px] text-muted-foreground font-normal">Bridge your engineering telemetry with OpsMind reasoning shard.</p>
                        </div>
                        <button className="btn-primary h-8.5 px-3">
                           <Plus className="h-4 w-4" /> <span>Provision New Link</span>
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isIntegrationsLoading ? (
                           Array(4).fill(0).map((_, i) => <div key={i} className="h-24 skeleton-ui opacity-80 rounded-[var(--radius)] animate-pulse" />)
                        ) : (
                           (integrations as any[])?.map(int => (
                             <div key={int.id} className="p-4 border border-border rounded-[var(--radius)] hover:border-border-strong transition-all group flex items-center justify-between bg-surface-alt/40 text-left">
                                <div className="flex items-center gap-3">
                                   <div className="h-9 w-9 bg-foreground text-background rounded-lg flex items-center justify-center shrink-0">
                                      <Webhook className="h-4.5 w-4.5" />
                                   </div>
                                   <div className="space-y-0.5">
                                      <div className="text-[13px] font-semibold text-foreground uppercase tracking-wider leading-tight">{int.name}</div>
                                      <div className="text-[10px] text-muted-foreground font-semibold">Platform Connector</div>
                                      <div className={cn("text-[9px] font-bold uppercase tracking-widest mt-1", 
                                          int.healthStatus === 'HEALTHY' ? "text-emerald-500" : "text-red-500")}>
                                         {int.healthStatus}
                                      </div>
                                    </div>
                                </div>
                                <button className="btn-secondary h-8 w-8 p-0 flex items-center justify-center">
                                   <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                             </div>
                           ))
                        )}
                        {/* Empty states for major platforms */}
                        {['Slack Command', 'PagerDuty', 'CloudWatch'].map(plat => (
                           <div key={plat} className="p-4 border border-dashed border-border rounded-[var(--radius)] opacity-70 flex items-center justify-between group hover:opacity-100 transition-all cursor-pointer text-left">
                              <div className="flex items-center gap-3">
                                 <div className="h-9 w-9 bg-surface-alt border border-border rounded-lg flex items-center justify-center shrink-0">
                                    <Globe className="h-4.5 w-4.5 text-muted-foreground" />
                                 </div>
                                 <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">{plat}</span>
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Link</span>
                           </div>
                        ))}
                     </div>
                  </div>
                )}

                {activeTab === 'SECURITY' && (
                  <div className="space-y-8">
                     <div className="space-y-1">
                        <h2 className="text-[18px] font-bold text-foreground">Security & Encryption</h2>
                        <p className="text-[12px] text-muted-foreground font-normal">Protect your administrative credentials and command chain.</p>
                     </div>

                     <form onSubmit={(e) => {
                       e.preventDefault()
                       if(passwordForm.newPassword !== passwordForm.confirmPassword) {
                         return toast.error('Passwords do not match.')
                       }
                       changePasswordMutation.mutate({
                         currentPassword: passwordForm.currentPassword,
                         newPassword: passwordForm.newPassword
                       })
                     }} className="p-6 border border-border bg-surface-alt/30 rounded-[var(--radius)] space-y-6">
                        <div className="flex items-center gap-2">
                           <Lock className="h-4.5 w-4.5 text-muted-foreground" />
                           <h3 className="text-[12px] font-bold uppercase tracking-wide text-foreground mb-0">Rotation Policy</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1.5 md:col-span-2">
                              <label className="label-enterprise">Current Knowledge Key</label>
                              <input type="password" required className="input-enterprise h-9.5" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
                           </div>
                           <div className="space-y-1.5">
                              <label className="label-enterprise">New Command Key</label>
                              <input type="password" required className="input-enterprise h-9.5" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                           </div>
                           <div className="space-y-1.5">
                              <label className="label-enterprise">Confirm Succession</label>
                              <input type="password" required className="input-enterprise h-9.5" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} />
                           </div>
                        </div>
                        <button 
                          type="submit" 
                          disabled={changePasswordMutation.isPending}
                          className="btn-primary h-9.5 w-full flex items-center justify-center gap-1.5 text-[13px]"
                        >
                           {changePasswordMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4.5 w-4.5" />}
                           <span>Rotate Master Credentials</span>
                        </button>
                     </form>

                     <div className="p-5 border border-border rounded-[var(--radius)] flex items-center justify-between bg-surface-alt/20">
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 bg-surface-alt border border-border rounded-lg flex items-center justify-center shrink-0">
                              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                           </div>
                           <div>
                              <div className="text-[13px] font-semibold text-foreground uppercase tracking-wider">Multi-factor Access Control</div>
                              <p className="text-[11px] text-muted-foreground italic m-0">Mandatory hardware MFA policies are enforced.</p>
                           </div>
                        </div>
                        <span className="badge-enterprise badge-success py-0.5">Compliant</span>
                     </div>
                  </div>
                )}

                {activeTab === 'AUDIT' && (
                  <div className="space-y-6">
                     <div className="flex items-start justify-between pb-2">
                        <div className="space-y-1">
                           <h2 className="text-[18px] font-bold text-foreground">Operational Audit Log</h2>
                           <p className="text-[12px] text-muted-foreground font-normal">Cryptographically signed record of all system modifications.</p>
                        </div>
                        <button className="btn-secondary h-8.5 px-3">
                           <Download className="h-4 w-4 mr-1.5" /> <span>Export Logs</span>
                        </button>
                     </div>

                     <div className="table-container">
                        <table className="table-enterprise">
                           <thead>
                              <tr>
                                 <th className="w-40 py-3">Action Shard</th>
                                 <th className="w-24">Module</th>
                                 <th>Logical Narrative</th>
                                 <th className="w-40 text-right">Timestamp</th>
                              </tr>
                           </thead>
                           <tbody>
                              {isAuditLoading ? (
                                 Array(8).fill(0).map((_, i) => (
                                   <tr key={i}><td colSpan={4} className="py-6"><div className="h-4 skeleton-ui w-full opacity-80 mx-auto animate-pulse" /></td></tr>
                                 ))
                              ) : (auditLogs as any[])?.length === 0 ? (
                                 <tr><td colSpan={4} className="py-20 text-center text-muted-foreground font-semibold italic text-[12px] uppercase">No historical audit telemetry discovered.</td></tr>
                              ) : (auditLogs as any[])?.map((log: any) => (
                                 <tr key={log.id}>
                                    <td className="font-semibold text-foreground py-3.5 text-left">{log.action}</td>
                                    <td>
                                       <span className="badge-enterprise bg-surface-alt border border-border text-foreground font-semibold">{log.module}</span>
                                    </td>
                                    <td className="text-[13px] font-medium text-foreground/80 leading-relaxed italic text-left">"{log.details}"</td>
                                    <td className="text-right text-[11px] font-semibold text-muted-foreground font-mono leading-tight">
                                       {new Date(log.timestamp).toLocaleDateString()}<br/>
                                       {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </td>
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
