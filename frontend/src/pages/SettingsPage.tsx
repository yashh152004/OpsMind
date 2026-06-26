import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  Eye,
  Camera,
  Mail,
  Phone,
  Briefcase,
  History,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  LogOut,
  Building,
  Key,
  Plus
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

  // Sync profile form when user data loads
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

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
    enabled: activeTab === 'ORGANIZATION'
  })

  const { data: auditLogs } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiClient.getAuditLogs(),
    enabled: activeTab === 'AUDIT'
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiClient.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully')
      queryClient.invalidateQueries({ queryKey: ['user', 'current'] })
    },
    onError: () => toast.error('Failed to update profile')
  })

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const toastId = toast.loading('Uploading avatar...')
    try {
      const result = await apiClient.uploadFile(file)
      setProfileForm(prev => ({ ...prev, avatarUrl: result.url }))
      toast.success('Avatar uploaded', { id: toastId })
    } catch (err) {
      toast.error('Upload failed', { id: toastId })
    }
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(profileForm)
  }

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'PROFILE', label: 'Profile', icon: User },
    { id: 'ORGANIZATION', label: 'Organization', icon: Building },
    { id: 'INTEGRATIONS', label: 'Integrations', icon: Webhook },
    { id: 'SECURITY', label: 'Security', icon: Shield },
    { id: 'AUDIT', label: 'Audit Logs', icon: History },
  ]

  return (
    <div className="max-w-6xl mx-auto main-content-grid page-transition-fade pb-20">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-black tracking-tight text-primary">Platform Settings</h1>
        <p className="text-sm text-muted">Configure your individual preferences and organization-wide policies.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded text-[13px] font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-lg shadow-blue-500/10" 
                    : "text-muted hover:bg-slate-100 hover:text-primary"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
            <div className="my-4 border-t border-border" />
            <button 
              onClick={() => logout()}
              className="flex items-center gap-3 px-4 py-3 rounded text-[13px] font-bold text-critical hover:bg-red-50 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1">
          <div className="enterprise-card bg-white min-h-[600px]">
             <div className="p-8">
                {activeTab === 'PROFILE' && (
                  <form onSubmit={handleSaveProfile} className="space-y-8">
                    <div className="flex items-start justify-between">
                       <div className="space-y-1">
                          <h2 className="text-lg font-bold text-primary">Identity Profile</h2>
                          <p className="text-xs text-muted">Manage your personal information and how you appear to the team.</p>
                       </div>
                       <button 
                         type="submit" 
                         disabled={updateProfileMutation.isPending}
                         className="btn-primary h-9 px-6 text-[11px] font-bold uppercase tracking-widest"
                       >
                         {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
                       </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-10">
                       {/* Avatar Section */}
                       <div className="flex flex-col items-center gap-4 pt-2">
                          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                             <div className="h-24 w-24 rounded bg-slate-100 border border-border overflow-hidden flex items-center justify-center shadow-inner relative">
                                {profileForm.avatarUrl ? (
                                    <img src={profileForm.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-black text-slate-300">{(profileForm.firstName[0] || '') + (profileForm.lastName[0] || '')}</span>
                                )}
                                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <Camera className="h-6 w-6 text-white" />
                                </div>
                             </div>
                             <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-white border border-border rounded-full flex items-center justify-center shadow-sm text-primary">
                                <Plus className="h-3 w-3" />
                             </div>
                          </div>
                          <input 
                            ref={fileInputRef} 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleAvatarUpload} 
                          />
                          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">JPG, PNG or WEBP (Max 2MB)</p>
                       </div>

                       {/* Fields */}
                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                                    <input className="input-field pl-9" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                                    <input className="input-field pl-9" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Job Title</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                                    <input className="input-field pl-9" placeholder="e.g. SRE Engineer" value={profileForm.title} onChange={e => setProfileForm({...profileForm, title: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Department</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                                    <input className="input-field pl-9" placeholder="e.g. Platform Ops" value={profileForm.department} onChange={e => setProfileForm({...profileForm, department: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                                    <input className="input-field pl-9" placeholder="+1 (555) 000-0000" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Email (Primary)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                                    <input disabled className="input-field pl-9 bg-slate-50 text-muted italic" value={user?.email || ''} />
                                </div>
                            </div>
                       </div>
                    </div>
                  </form>
                )}

                {activeTab === 'ORGANIZATION' && (
                  <div className="space-y-8">
                     <div className="flex items-start justify-between">
                       <div className="space-y-1">
                          <h2 className="text-lg font-bold text-primary">Organization Settings</h2>
                          <p className="text-xs text-muted">Manage team members and overall workspace policy.</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                        <section className="space-y-3">
                           <h3 className="text-xs font-black uppercase tracking-widest text-muted border-b border-border pb-2">Active Team Members</h3>
                           <div className="enterprise-table-container">
                                <table className="enterprise-table text-[12px]">
                                    <thead>
                                        <tr>
                                            <th>Member</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th className="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(users as any[])?.map(u => (
                                            <tr key={u.email}>
                                                <td className="font-bold">{u.firstName} {u.lastName} <div className="text-[10px] font-medium text-muted normal-case italic">{u.email}</div></td>
                                                <td><span className="font-mono">{u.role}</span></td>
                                                <td><span className="status-badge badge-success">{u.status}</span></td>
                                                <td className="text-right">
                                                    <button className="text-critical hover:underline font-bold uppercase tracking-widest text-[9px]">Revoke</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                           </div>
                        </section>
                    </div>
                  </div>
                )}

                {activeTab === 'INTEGRATIONS' && (
                  <div className="space-y-8">
                     <div className="flex items-start justify-between">
                       <div className="space-y-1">
                          <h2 className="text-lg font-bold text-primary">Real-Time Connectors</h2>
                          <p className="text-xs text-muted">Bridge OpsMind with your existing engineering toolchain.</p>
                       </div>
                       <button className="btn-primary h-9 px-4 text-[10px] font-bold uppercase tracking-widest">
                          <Plus className="h-3.5 w-3.5" /> New Connector
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {[
                         { id: 'slack', name: 'Slack', icon: Slack, desc: 'Send alerts to #ops-war-room', color: 'text-[#4A154B]', status: 'ACTIVE' },
                         { id: 'pd', name: 'PagerDuty', icon: Shield, desc: 'Escalate critical P1 incidents', color: 'text-[#06AC38]', status: 'ERROR' },
                         { id: 'webhook', name: 'Custom Webhook', icon: Globe, desc: 'Push data to internal gRPC sink', color: 'text-primary', status: 'INACTIVE' },
                         { id: 'teams', name: 'MS Teams', icon: Mail, desc: 'Enterprise collaboration sync', color: 'text-[#6264A7]', status: 'INACTIVE' },
                       ].map(int => (
                         <div key={int.id} className="p-4 border border-border rounded flex items-center justify-between group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="h-10 w-10 bg-slate-50 border border-border rounded flex items-center justify-center">
                                  <int.icon className={cn("h-5 w-5", int.color)} />
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-primary">{int.name}</div>
                                  <div className="text-[11px] text-muted">{int.desc}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className={cn(
                                 "h-2 w-2 rounded-full",
                                 int.status === 'ACTIVE' ? "bg-success" : int.status === 'ERROR' ? "bg-critical" : "bg-slate-300"
                               )} />
                               <button className="btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="h-4 w-4" /></button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {activeTab === 'SECURITY' && (
                  <div className="space-y-10">
                     <div className="space-y-1">
                        <h2 className="text-lg font-bold text-primary">Privacy & Security</h2>
                        <p className="text-xs text-muted">Manage authentication protocols and platform-wide security keys.</p>
                     </div>

                     <div className="space-y-6">
                        <section className="space-y-4">
                           <h3 className="text-xs font-black uppercase tracking-widest text-muted border-b border-border pb-2">Global API Access Key</h3>
                           <div className="p-4 bg-slate-50 border border-border rounded-sm space-y-4">
                              <div className="flex items-center justify-between">
                                 <div className="font-mono text-[12px] text-primary">ops_live_948a********************b12z</div>
                                 <div className="flex items-center gap-2">
                                    <button className="text-[10px] font-bold text-accent hover:underline uppercase">Reveal</button>
                                    <div className="h-3 w-[1px] bg-border" />
                                    <button className="text-[10px] font-bold text-accent hover:underline uppercase">Copy</button>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2 text-critical">
                                 <AlertTriangle className="h-3.5 w-3.5" />
                                 <span className="text-[10px] font-bold uppercase tracking-wider">Warning: Never expose this key in client-side codebases.</span>
                              </div>
                           </div>
                        </section>

                        <section className="space-y-4">
                           <h3 className="text-xs font-black uppercase tracking-widest text-muted border-b border-border pb-2">Two-Factor Authentication</h3>
                           <div className="flex items-center justify-between p-4 border border-border rounded">
                              <div className="flex items-center gap-4">
                                 <div className="h-10 w-10 bg-slate-50 rounded flex items-center justify-center text-muted">
                                    <Lock className="h-5 w-5" />
                                 </div>
                                 <div>
                                    <div className="text-sm font-bold text-primary">Mobile Authenticator</div>
                                    <div className="text-[11px] text-muted">Use Google Authenticator or Authy to generate keys.</div>
                                 </div>
                              </div>
                              <button className="btn-secondary h-8 px-4 text-[10px] font-bold uppercase tracking-widest">Enable</button>
                           </div>
                        </section>
                     </div>
                  </div>
                )}

                {activeTab === 'AUDIT' && (
                  <div className="space-y-6">
                     <div className="flex items-start justify-between">
                       <div className="space-y-1">
                          <h2 className="text-lg font-bold text-primary">Platform Audit History</h2>
                          <p className="text-xs text-muted">A sequential record of all administrative and system operations.</p>
                       </div>
                       <button className="btn-secondary h-8 px-4 text-[10px] font-bold uppercase tracking-widest">
                          <History className="h-3.5 w-3.5" /> Export History
                       </button>
                    </div>

                    <div className="enterprise-table-container">
                       <table className="enterprise-table text-[11px]">
                          <thead className="bg-[#0B1222]">
                             <tr>
                                <th className="w-24 text-white">Action</th>
                                <th className="w-24 text-white">Module</th>
                                <th className="text-white">Details</th>
                                <th className="w-32 text-white">Timestamp</th>
                             </tr>
                          </thead>
                          <tbody>
                             {(auditLogs as any[])?.map((log: any) => (
                               <tr key={log.id}>
                                  <td><span className="font-bold text-accent">{log.action}</span></td>
                                  <td><span className="text-muted font-bold text-[10px] uppercase">{log.module}</span></td>
                                  <td className="font-medium">{log.details}</td>
                                  <td className="font-mono text-muted">{new Date(log.timestamp).toLocaleString()}</td>
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
