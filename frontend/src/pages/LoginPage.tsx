import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { toast } from 'sonner'
import { Activity, Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoginLoading, loginError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgIdentifier, setOrgIdentifier] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !orgIdentifier) {
      toast.error('Please fill in all security fields')
      return
    }
    login({ email, password, organizationIdentifier: orgIdentifier })
  }

  return (
    <div className="w-full max-w-[440px] mx-auto animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-16 w-16 rounded-2xl premium-gradient flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold font-outfit tracking-tight mb-2">OpsMind</h1>
          <p className="text-muted-foreground font-medium text-sm">Enterprise Incident Intelligence Platform</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-10 border border-white/5 space-y-8">
          <div>
            <h2 className="text-2xl font-bold font-outfit">Identity Verification</h2>
            <p className="text-sm text-muted-foreground mt-1">Access your organization's control plane.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Organization ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Shield className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={orgIdentifier}
                  onChange={(e) => setOrgIdentifier(e.target.value)}
                  className="input-field pl-12"
                  placeholder="acme-engineering"
                  disabled={isLoginLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Corporate Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="sre@acme.corp"
                  disabled={isLoginLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Access Key</label>
                <Link to="#" className="text-[10px] uppercase font-bold text-primary hover:underline">Reset Key</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  disabled={isLoginLoading}
                />
              </div>
            </div>

            {loginError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 text-red-200 text-sm animate-fade-in">
                <Shield className="h-5 w-5 text-red-500 shrink-0" />
                <span>Verification failed. Invalid credentials.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoginLoading}
              className="btn-primary w-full h-12 mt-4"
            >
              {isLoginLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Sign into Node <ArrowRight className="h-5 w-5 ml-1" /></>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm font-medium">
            New to OpsMind? {' '}
            <Link to="/register" className="text-primary font-bold hover:underline">Scale Up Your Team</Link>
          </p>
        </div>
    </div>
  )
}

export default LoginPage
