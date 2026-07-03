import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  User, Shield, Globe, MessageSquare, Webhook, Lock, ChevronRight, Camera,
  Mail, Phone, Briefcase, History, AlertTriangle, LogOut, Building,
  Plus, Eye, EyeOff, Key, Terminal, CreditCard, Bell, Layout, Settings as SettingsIcon, ShieldCheck, Download,
  CheckCircle2, AlertCircle, RefreshCw, Clock, MapPin, Search
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

  const { data: organization, isLoading: isOrgLoading } = useQuery({
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
    <div className="page-transition-fade space-y-8 p-6 lg:p-8 bg-background min-h-screen max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold tracking-tight text-foreground m-0">Platform Settings</h1>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded text-[11px] font-bold uppercase tracking-wider">
                 <SettingsIcon className="h-3.5 w-3.5" />
                 Global Configuration
              </div>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted flex items-center gap-1.5">
                 <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Administrative Access Verified
              </p>
           </div>
        </div>
        <button 
          onClick={() => logout()}
          className="btn-secondary h-9 text-red-600 hover:bg-red-50 hover:border-red-200"
        >
           <LogOut className="h-4 w-4" />
           <span className="ml-2">Sign Out</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Rail */}
        <aside className="w-full lg:w-64 shrink-0">
           <div className="flex flex-col gap-1 p-1 bg-surface-alt rounded-lg border border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[13px] font-semibold transition-all text-left",
                    activeTab === tab.id 
                      ? "bg-white text-foreground shadow-sm border border-border" 
                      : "text-muted hover:text-foreground hover:bg-surface-hover/50"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-foreground" : "text-muted")} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight className="h-4 w-4 ml-auto opacity-80" />}
                </button>
              ))}
           </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <div className="card-enterprise p-8 overflow-hidden">
             <div className="max-w-4xl">
                {activeTab === 'PROFILE' && (
                  <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(profileForm); }} className="space-y-10">
                    <div className="flex items-start justify-between">
                       <div className="space-y-1">
                          <h2 className="text-xl font-bold text-foreground">Identity Profile</h2>
                          <p className="text-[14px] text-muted font-medium">Synchronize your personal credentials across the platform.</p>
                       </div>
                       <button 
                         type="submit" 
                         disabled={updateProfileMutation.isPending}
                         className="btn-primary h-9 px-6"
                       >
                          {updateProfileMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save Profile'}
                       </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12">
                       <div className="flex flex-col items-center gap-4 shrink-0">
                          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                             <div className="h-24 w-24 rounded-2xl border border-border overflow-hidden bg-surface-alt flex items-center justify-center transition-all group-hover:border-foreground">
                                {profileForm.avatarUrl ? (
                                    <img src={profileForm.avatarUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-8 w-8 text-border" />
                                )}
                                <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-background">
                                   <Camera className="h-5 w-5" />
                                </div>
                             </div>
                          </div>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                       </div>

                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-1.5">
                                 <label className="label-enterprise">First Name</label>
                                 <input required className="input-enterprise h-10 font-semibold" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="label-enterprise">Last Name</label>
                                 <input required className="input-enterprise h-10 font-semibold" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="label-enterprise">Professional Title</label>
                                 <input className="input-enterprise h-10 font-semibold" placeholder="e.g. Senior Site Reliability Engineer" value={profileForm.title} onChange={e => setProfileForm({...profileForm, title: e.target.value})} />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="label-enterprise">Department</label>
                                 <input className="input-enterprise h-10 font-semibold" placeholder="e.g. Cloud Operations" value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})} />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="label-enterprise">Mobile / Dispatch Phone</label>
                                 <input className="input-enterprise h-10 font-semibold" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                             </div>
                             <div className="space-y-1.5">
                                 <label className="label-enterprise">Login Email</label>
                                 <input disabled className="input-enterprise h-10 bg-surface-alt cursor-not-allowed opacity-100 font-medium italic" value={user?.email || ''} />
                             </div>
                       </div>
                    </div>
                  </form>
                )}

                {activeTab === 'WORKSPACE' && (
                  <div className="space-y-12">
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                           <h2 className="text-xl font-bold text-foreground">Workspace Configuration</h2>
                           <p className="text-[14px] text-muted font-medium">Manage organization-level parameters and squad access.</p>
                        </div>
                        <button 
                          onClick={() => updateOrgMutation.mutate(workspaceForm)}
                          disabled={updateOrgMutation.isPending}
                          className="btn-primary h-9 px-6"
                        >
                           {updateOrgMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10 border-b border-border">
                        <div className="space-y-1.5">
                           <label className="label-enterprise">Organization Name</label>
                           <input className="input-enterprise h-10 font-bold" value={workspaceForm.name} onChange={e => setWorkspaceForm({...workspaceForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                           <label className="label-enterprise">Slug</label>
                           <div className="flex items-center gap-2">
                              <span className="text-muted font-mono text-sm">opsmind.io/</span>
                              <input className="input-enterprise h-10 font-bold w-full" value={workspaceForm.slug} onChange={e => setWorkspaceForm({...workspaceForm, slug: e.target.value})} />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-[12px] font-bold uppercase tracking-widest text-foreground m-0">Squad Directory</h3>
                           <button className="btn-secondary h-8 px-3 text-[11px] font-bold">Invite Member</button>
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
                                          <tr key={i}><td colSpan={4} className="py-8"><div className="h-5 skeleton-ui w-full opacity-90" /></td></tr>
                                        ))
                                     ) : (users as any[])?.map(u => (
                                         <tr key={u.email} className="group">
                                             <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                   <div className="h-8 w-8 rounded-full bg-surface-alt border border-border flex items-center justify-center text-[11px] font-bold text-foreground">
                                                      {u.firstName[0]}{u.lastName[0]}
                                                   </div>
                                                   <div className="flex flex-col">
                                                      <span className="text-[13px] font-bold text-foreground">{u.firstName} {u.lastName}</span>
                                                      <span className="text-[11px] text-muted normal-case">{u.email}</span>
                                                   </div>
                                                </div>
                                             </td>
                                             <td><span className="text-[11px] font-bold uppercase tracking-tight text-foreground">{u.role}</span></td>
                                             <td className="text-center font-bold text-[10px] uppercase tracking-widest text-emerald-600 italic">{u.status}</td>
                                             <td className="text-right">
                                                 {u.email !== user?.email && (
                                                   <button 
                                                     onClick={() => { if(confirm('Revoke access?')) apiClient.revokeAccess(u.id); }}
                                                     className="text-red-500 hover:opacity-70 font-bold uppercase tracking-widest text-[9px] transition-all"
                                                   >
                                                      Revoke access
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
                  <div className="space-y-12">
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                           <h2 className="text-xl font-bold text-foreground">Ecosystem Connectors</h2>
                           <p className="text-[14px] text-muted font-medium">Bridge your engineering telemetry with OpsMind reasoning shard.</p>
                        </div>
                        <button className="btn-primary h-9 px-6">
                           <Plus className="h-4 w-4 mr-2" /> Provision New Link
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isIntegrationsLoading ? (
                           Array(4).fill(0).map((_, i) => <div key={i} className="h-24 skeleton-ui opacity-80 rounded-xl" />)
                        ) : (
                           (integrations as any[])?.map(int => (
                             <div key={int.id} className="p-5 border border-border rounded-xl hover:border-foreground transition-all group flex items-center justify-between bg-surface-alt/20">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 bg-foreground text-background rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                                      <Webhook className="h-5 w-5" />
                                   </div>
                                   <div className="space-y-0.5">
                                      <div className="text-[14px] font-bold text-foreground uppercase tracking-wider">{int.name}</div>
                                      <div className="text-[11px] text-muted font-semibold">Platform Connector</div>
                                      <div className={cn("text-[8px] font-black uppercase tracking-widest mt-1", 
                                          int.healthStatus === 'HEALTHY' ? "text-emerald-500" : "text-red-500")}>
                                         {int.healthStatus}
                                      </div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-white rounded-md transition-all opacity-80 group-hover:opacity-100">
                                   <ChevronRight className="h-4 w-4 text-foreground" />
                                </button>
                             </div>
                           ))
                        )}
                        {/* Empty states for major platforms */}
                        {['Slack Command', 'PagerDuty', 'CloudWatch'].map(plat => (
                           <div key={plat} className="p-5 border border-dashed border-border rounded-xl opacity-80 grayscale flex items-center justify-between group hover:opacity-100 transition-all cursor-pointer">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                                    <Globe className="h-5 w-5 text-neutral-400" />
                                 </div>
                                 <span className="text-[13px] font-bold text-muted uppercase tracking-widest">{plat}</span>
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Link</span>
                           </div>
                        ))}
                     </div>
                  </div>
                )}

                {activeTab === 'SECURITY' && (
                  <div className="space-y-12">
                     <div className="space-y-1">
                        <h2 className="text-xl font-bold text-foreground">Security & Encryption</h2>
                        <p className="text-[14px] text-muted font-medium">Protect your administrative credentials and command chain.</p>
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
                     }} className="p-8 border border-border bg-surface-alt/30 rounded-2xl space-y-8">
                        <div className="flex items-center gap-3">
                           <Lock className="h-5 w-5 text-foreground" />
                           <h3 className="text-[13px] font-bold uppercase tracking-widest text-foreground mb-0">Rotation Policy</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-1.5 md:col-span-2">
                              <label className="label-enterprise">Current Knowledge Key</label>
                              <input type="password" required className="input-enterprise h-10 bg-white" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
                           </div>
                           <div className="space-y-1.5">
                              <label className="label-enterprise">New Command Key</label>
                              <input type="password" required className="input-enterprise h-10 bg-white" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                           </div>
                           <div className="space-y-1.5">
                              <label className="label-enterprise">Confirm Succession</label>
                              <input type="password" required className="input-enterprise h-10 bg-white" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} />
                           </div>
                        </div>
                        <button 
                          type="submit" 
                          disabled={changePasswordMutation.isPending}
                          className="btn-primary h-11 w-full"
                        >
                           {changePasswordMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                           Rotate Master Key
                        </button>
                     </form>

                     <div className="p-6 border border-border rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                              <ShieldCheck className="h-5 w-5 text-emerald-600" />
                           </div>
                           <div>
                              <div className="text-[14px] font-bold text-foreground uppercase tracking-tight">Active Multi-factor</div>
                              <p className="text-[12px] text-muted italic">Mandatory hardware-based verification enabled.</p>
                           </div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] italic">Compliant</span>
                     </div>
                  </div>
                )}

                {activeTab === 'AUDIT' && (
                  <div className="space-y-8">
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                           <h2 className="text-xl font-bold text-foreground">Operational Audit Log</h2>
                           <p className="text-[14px] text-muted font-medium">Cryptographically signed record of all system modifications.</p>
                        </div>
                        <button className="btn-secondary h-9">
                           <Download className="h-4 w-4 mr-2" /> Export
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
                                   <tr key={i}><td colSpan={4} className="py-6"><div className="h-4 skeleton-ui w-full opacity-80 mx-auto" /></td></tr>
                                 ))
                              ) : (auditLogs as any[])?.length === 0 ? (
                                 <tr><td colSpan={4} className="py-20 text-center text-muted font-bold italic text-[13px]">No audit historical shards found.</td></tr>
                              ) : (auditLogs as any[])?.map((log: any) => (
                                <tr key={log.id}>
                                   <td className="font-bold text-foreground py-3 italic">{log.action}</td>
                                   <td><span className="text-[10px] font-bold uppercase tracking-widest text-muted bg-surface-alt px-1.5 py-0.5 rounded border border-border">{log.module}</span></td>
                                   <td className="text-[13px] font-medium text-foreground leading-relaxed italic">{log.details}</td>
                                   <td className="text-right text-[11px] font-bold text-muted font-mono leading-tight">
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
