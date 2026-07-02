import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  User, Shield, Globe, MessageSquare, Webhook, Lock, ChevronRight, Camera,
  Mail, Phone, Briefcase, History, AlertTriangle, LogOut, Building,
  Plus, Eye, EyeOff, Key, Terminal, CreditCard, Bell, Layout, Settings as SettingsIcon, ShieldCheck, Download,
  CheckCircle2, AlertCircle, RefreshCw
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
      toast.success('PRO_ID_SYNC: Identity credentials synchronized successfully.')
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
    },
    onError: () => toast.error('PRO_FAULT: Identity synchronization failure.')
  })

  const updateOrgMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateOrganization(data),
    onSuccess: () => {
      toast.success('WORKSPACE_SYNCED: Organization policies updated.')
      queryClient.invalidateQueries({ queryKey: ['my-organization'] })
    },
    onError: () => toast.error('SYNC_FAULT: Organization update failed.')
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => apiClient.changePassword(data),
    onSuccess: () => {
      toast.success('SECURITY_ROTATED: Global command password updated.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'ROTATION_FAULT: Encryption key update failed.')
  })

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const toastId = toast.loading('BUFFERING_ASSET...')
    try {
      const result = await apiClient.uploadFile(file)
      setProfileForm(prev => ({ ...prev, avatarUrl: result.url }))
      // Auto-save profile with new avatar
      updateProfileMutation.mutate({ ...profileForm, avatarUrl: result.url })
      toast.success('ASSET_READY', { id: toastId })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'UPLOAD_FAULT: Buffer transmission failed.'
      toast.error(errorMessage, { id: toastId })
      console.error('Avatar Upload Error:', err)
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
    { id: 'SECURITY', label: 'Encryption', icon: Lock },
    { id: 'AUDIT', label: 'Audit Log', icon: History },
  ]

  return (
    <div className="page-transition-fade space-y-12 p-8 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tighter text-black font-geist uppercase">Settings</h1>
           <div className="flex items-center gap-4">
              <p className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                 <SettingsIcon className="h-4 w-4 text-black" /> Configuration & Policy Matrix
              </p>
              <div className="h-4 w-[1px] bg-border" />
              <p className="text-[10px] font-bold text-black uppercase tracking-widest">Operator State: Authenticated</p>
           </div>
        </div>
        <button 
          onClick={() => logout()}
          className="btn-secondary h-10 border-strong text-red-600 hover:bg-red-50 hover:border-red-200"
        >
           <LogOut className="h-4 w-4" />
           <span className="ml-2 font-black uppercase tracking-widest text-[11px]">Terminate Session</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-64 shrink-0 space-y-1">
           <div className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-4 pl-3">Navigation Shards</div>
           {tabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "w-full flex items-center gap-3 px-4 py-3 rounded text-[12px] font-black uppercase tracking-widest transition-all border",
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

        <main className="flex-1">
          <div className="enterprise-card bg-white border-strong min-h-[700px] shadow-sm">
             <div className="p-10">
                {activeTab === 'PROFILE' && (
                  <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(profileForm); }} className="space-y-12">
                    <div className="flex items-start justify-between">
                       <div className="space-y-1">
                          <h2 className="text-2xl font-black text-black font-geist uppercase">Identity Credentials</h2>
                          <p className="text-[12px] text-muted font-medium italic">Synchronize your operational profile across the mesh.</p>
                       </div>
                       <button 
                         type="submit" 
                         disabled={updateProfileMutation.isPending}
                         className="btn-primary h-10 px-8 shadow-xl shadow-black/10 text-[11px] font-black uppercase tracking-widest"
                       >
                          {updateProfileMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Sync Profile'}
                       </button>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-16">
                       <div className="flex flex-col items-center gap-4 shrink-0">
                          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                             <div className="h-32 w-32 rounded-lg border-2 border-black overflow-hidden flex items-center justify-center bg-surface-alt shadow-[12px_12px_0px_rgba(0,0,0,0.05)] relative group-hover:scale-105 transition-all">
                                {profileForm.avatarUrl ? (
                                    <img src={profileForm.avatarUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-black text-black/10">{(profileForm.firstName[0] || '') + (profileForm.lastName[0] || '')}</span>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <Camera className="h-8 w-8 text-white" />
                                </div>
                             </div>
                          </div>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                          <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">JPG/PNG MAX 2MB</p>
                       </div>

                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                             <div className="space-y-2">
                                 <label className="form-label text-[10px] font-black text-black uppercase tracking-widest">FirstName</label>
                                 <input required className="input-field border-strong h-11 font-bold" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                 <label className="form-label text-[10px] font-black text-black uppercase tracking-widest">LastName</label>
                                 <input required className="input-field border-strong h-11 font-bold" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                 <label className="form-label text-[10px] font-black text-black uppercase tracking-widest">SRE Title</label>
                                 <input className="input-field border-strong h-11 font-bold" placeholder="e.g. Staff Software Engineer" value={profileForm.title} onChange={e => setProfileForm({...profileForm, title: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                 <label className="form-label text-[10px] font-black text-black uppercase tracking-widest">Department</label>
                                 <input className="input-field border-strong h-11 font-bold" placeholder="e.g. Platform Lifecycle" value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                 <label className="form-label text-[10px] font-black text-black uppercase tracking-widest">Contact Phone</label>
                                 <input className="input-field border-strong h-11 font-bold" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                 <label className="form-label text-[10px] font-black text-black uppercase tracking-widest">Authenticated Email</label>
                                 <input disabled className="input-field border-strong bg-surface-alt/50 text-muted italic h-11 cursor-not-allowed font-medium" value={user?.email || ''} />
                             </div>
                       </div>
                    </div>
                  </form>
                )}

                {activeTab === 'WORKSPACE' && (
                  <div className="space-y-12">
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-black text-black font-geist uppercase">Workspace Logic</h2>
                          <p className="text-[12px] text-muted font-medium italic">Configure organization-level observability parameters.</p>
                        </div>
                        <button 
                          onClick={() => updateOrgMutation.mutate(workspaceForm)}
                          disabled={updateOrgMutation.isPending}
                          className="btn-primary h-10 px-8 shadow-xl shadow-black/10 text-[11px] font-black uppercase tracking-widest"
                        >
                           {updateOrgMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save Parameters'}
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pb-10 border-b border-border">
                        <div className="space-y-2">
                           <label className="form-label text-[10px] font-black text-black uppercase tracking-widest">Organization Name</label>
                           <input className="input-field border-strong h-11 font-bold" value={workspaceForm.name} onChange={e => setWorkspaceForm({...workspaceForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="form-label text-[10px] font-black text-black uppercase tracking-widest">Organization Slug</label>
                           <input className="input-field border-strong h-11 font-bold bg-surface-alt/20" value={workspaceForm.slug} onChange={e => setWorkspaceForm({...workspaceForm, slug: e.target.value})} />
                        </div>
                     </div>

                     <div className="space-y-8 pt-4">
                        <div className="flex items-center justify-between border-b-2 border-black pb-4">
                           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black m-0 border-none">Squad Integrity Matrix</h3>
                           <button className="h-8 px-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90">Add Member</button>
                        </div>
                        <div className="enterprise-table-container border-strong rounded overflow-hidden">
                             <table className="enterprise-table">
                                 <thead>
                                     <tr className="bg-surface-alt/30">
                                         <th className="text-[10px] font-black uppercase tracking-widest py-4">Squad Member</th>
                                         <th className="text-[10px] font-black uppercase tracking-widest">Security Rank</th>
                                         <th className="text-[10px] font-black uppercase tracking-widest">State</th>
                                         <th className="text-[10px] font-black uppercase tracking-widest text-right pr-6">Logic</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {isUsersLoading ? (
                                        Array(3).fill(0).map((_, i) => (
                                          <tr key={i}><td colSpan={4} className="py-8"><div className="h-6 skeleton w-full" /></td></tr>
                                        ))
                                     ) : (users as any[])?.map(u => (
                                         <tr key={u.email} className="group hover:bg-surface-alt/50 transition-colors">
                                             <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                   <div className="h-8 w-8 rounded bg-black text-white flex items-center justify-center text-[10px] font-black">
                                                      {u.firstName[0]}{u.lastName[0]}
                                                   </div>
                                                   <div className="flex flex-col">
                                                      <span className="text-[13px] font-black text-black">{u.firstName} {u.lastName}</span>
                                                      <span className="text-[10px] font-medium text-muted normal-case italic">{u.email}</span>
                                                   </div>
                                                </div>
                                             </td>
                                             <td><span className="font-mono text-[11px] font-black uppercase bg-black/5 px-2 py-0.5 rounded">{u.role}</span></td>
                                             <td><span className={cn("status-badge", u.status === 'ACTIVE' ? 'badge-success' : 'badge-warning')}>{u.status}</span></td>
                                             <td className="text-right pr-6">
                                                 {u.email !== user?.email && (
                                                   <button 
                                                     onClick={() => { if(confirm('Revoke access?')) apiClient.revokeAccess(u.id); }}
                                                     className="text-red-600 hover:text-red-700 font-black uppercase tracking-widest text-[9px] underline transition-all"
                                                   >
                                                      Revoke_Access
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
                           <h2 className="text-2xl font-black text-black font-geist uppercase">Signal Connectors</h2>
                           <p className="text-[12px] text-muted font-medium italic">Bridge OpsMind mesh with global engineering toolchains.</p>
                        </div>
                        <button className="btn-primary h-10 shadow-xl shadow-black/10 text-[11px] font-black uppercase tracking-widest">
                           <Plus className="h-4 w-4 mr-2" /> Provision Link
                        </button>
                     </div>

                     {isIntegrationsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 skeleton rounded" />)}
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {(integrations as any[])?.map(int => (
                             <div key={int.id} className="p-6 border-2 border-border-strong rounded-none shadow-sm hover:border-black transition-all group flex items-center justify-between bg-white">
                                <div className="flex items-center gap-5">
                                   <div className="h-12 w-12 bg-black text-white rounded flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                      <Webhook className="h-6 w-6" />
                                   </div>
                                   <div className="space-y-0.5">
                                      <div className="text-[14px] font-black text-black uppercase tracking-widest">{int.name}</div>
                                      <div className="text-[11px] text-muted font-medium leading-tight">{int.type} / last_sync: {new Date(int.lastSyncTime).toLocaleDateString()}</div>
                                      <div className="flex items-center gap-2 pt-1">
                                         <span className={cn(
                                           "text-[9px] font-black uppercase px-1.5 py-0.5 rounded",
                                           int.healthStatus === 'HEALTHY' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                         )}>
                                            {int.healthStatus}
                                         </span>
                                      </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <button className="p-2 hover:bg-surface-alt rounded border border-transparent hover:border-border transition-all">
                                      <ChevronRight className="h-4 w-4 text-muted group-hover:text-black group-hover:translate-x-1" />
                                   </button>
                                </div>
                             </div>
                           ))}
                           {/* Add static placeholders for unconfigured major integrations */}
                           {['Slack', 'GitHub', 'AWS S3', 'PagerDuty'].map(service => (
                             <div key={service} className="p-6 border-2 border-dashed border-border-strong rounded-none hover:border-black/20 transition-all group flex items-center justify-between bg-surface-alt/10 grayscale opacity-60">
                                <div className="flex items-center gap-5">
                                   <div className="h-12 w-12 bg-neutral-200 text-neutral-400 rounded flex items-center justify-center">
                                      <Terminal className="h-6 w-6" />
                                   </div>
                                   <div className="space-y-0.5">
                                      <div className="text-[14px] font-black text-neutral-500 uppercase tracking-widest">{service}</div>
                                      <div className="text-[11px] text-neutral-400 font-medium leading-tight">Integration shard not yet linked.</div>
                                    </div>
                                </div>
                                <button className="text-[10px] font-black uppercase text-black underline">Provision</button>
                             </div>
                           ))}
                        </div>
                     )}
                  </div>
                )}

                {activeTab === 'SECURITY' && (
                  <div className="space-y-12">
                     <div className="space-y-1">
                        <h2 className="text-2xl font-black text-black font-geist uppercase">Encryption Shard</h2>
                        <p className="text-[12px] text-muted font-medium italic">Manage global command keys and authentication rotations.</p>
                     </div>

                      <div className="space-y-12">
                         <form onSubmit={(e) => {
                           e.preventDefault()
                           if(passwordForm.newPassword !== passwordForm.confirmPassword) {
                             return toast.error('SECURITY_FAULT: Passwords do not match.')
                           }
                           changePasswordMutation.mutate({
                             currentPassword: passwordForm.currentPassword,
                             newPassword: passwordForm.newPassword
                           })
                         }} className="space-y-8 bg-surface-alt/20 p-8 border-2 border-black border-dashed">
                            <div className="flex items-center gap-3 mb-2">
                               <Lock className="h-5 w-5 text-black" />
                               <h3 className="text-[13px] font-black uppercase tracking-widest text-black mb-0 border-none">Credential Rotation</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                               <div className="space-y-2">
                                  <label className="form-label text-[10px] font-black">Original Key</label>
                                  <input type="password" required className="input-field border-strong bg-white h-11" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
                               </div>
                               <div className="space-y-2">
                                  <label className="form-label text-[10px] font-black">Successor Key</label>
                                  <input type="password" required className="input-field border-strong bg-white h-11" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                               </div>
                               <div className="space-y-2">
                                  <label className="form-label text-[10px] font-black">Verify Successor</label>
                                  <input type="password" required className="input-field border-strong bg-white h-11" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} />
                               </div>
                            </div>
                            <button 
                              type="submit" 
                              disabled={changePasswordMutation.isPending}
                              className="btn-primary w-full h-12 text-[11px] font-black uppercase tracking-[0.3em] shadow-lg"
                            >
                               {changePasswordMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'RE-ENCRYPT CREDENTIALS'}
                            </button>
                         </form>

                         <section className="space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted border-b border-border pb-3">Session Integrity</h3>
                            <div className="p-8 border-2 border-border-strong bg-white flex items-center justify-between group hover:border-black transition-all">
                               <div className="flex items-center gap-6">
                                  <div className="h-12 w-12 bg-black text-white rounded flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                     <ShieldCheck className="h-6 w-6" />
                                  </div>
                                  <div className="space-y-1">
                                     <div className="text-[14px] font-black text-black uppercase tracking-widest">Active Device Loop</div>
                                     <div className="text-[11px] text-muted font-medium italic">Enforce multi-factor verification on all critical signal remediations.</div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2 text-emerald-600">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">PROTECTED</span>
                               </div>
                            </div>
                         </section>
                      </div>
                  </div>
                )}

                {activeTab === 'AUDIT' && (
                  <div className="space-y-8">
                     <div className="flex items-start justify-between">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-black text-black font-geist uppercase">Operational Audit</h2>
                           <p className="text-[12px] text-muted font-medium italic">Non-repudiable record of all administrative mesh operations.</p>
                        </div>
                        <button className="btn-secondary h-10 border-strong text-[11px] font-black uppercase tracking-widest">
                           <Download className="h-4 w-4 mr-2" /> Export Log
                        </button>
                     </div>

                     <div className="enterprise-table-container border-2 border-border-strong rounded-none shadow-2xl shadow-black/5 overflow-hidden">
                        <table className="enterprise-table">
                           <thead>
                              <tr className="bg-black text-white">
                                 <th className="w-40 text-[9px] uppercase tracking-[0.2em] py-4">Action Shard</th>
                                 <th className="w-32 text-[9px] uppercase tracking-[0.2em]">Module</th>
                                 <th className="text-[9px] uppercase tracking-[0.2em]">Narrative & Context</th>
                                 <th className="w-48 text-right pr-6 text-[9px] uppercase tracking-[0.2em]">Precision Clock</th>
                              </tr>
                           </thead>
                           <tbody className="bg-white">
                              {isAuditLoading ? (
                                 Array(8).fill(0).map((_, i) => (
                                   <tr key={i}><td colSpan={4} className="py-8"><div className="h-6 skeleton w-full" /></td></tr>
                                 ))
                              ) : (auditLogs as any[])?.length === 0 ? (
                                 <tr><td colSpan={4} className="py-20 text-center text-muted font-black uppercase tracking-widest text-[11px]">No audit signals detected in current shard.</td></tr>
                              ) : (auditLogs as any[])?.map((log: any) => (
                                <tr key={log.id} className="group hover:bg-surface-alt/30 transition-all border-b border-border-strong last:border-0">
                                   <td className="font-black text-black uppercase tracking-[0.15em] italic py-4">{log.action}</td>
                                   <td><span className="text-[9px] font-black uppercase tracking-widest text-white bg-black/60 px-2.5 py-1 rounded-sm">{log.module}</span></td>
                                   <td className="font-bold text-black pr-10 text-[13px]">{log.details}</td>
                                   <td className="font-mono text-[10px] font-black text-black/40 text-right pr-6 leading-tight whitespace-nowrap">
                                      {new Date(log.timestamp).toLocaleDateString()}<br/>
                                      {new Date(log.timestamp).toLocaleTimeString()}
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
