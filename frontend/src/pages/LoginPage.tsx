import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { toast } from 'sonner'
import { Activity, Shield, Lock, Mail, ArrowRight, Loader2, Key } from 'lucide-react'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoginLoading, loginError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgIdentifier, setOrgIdentifier] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !orgIdentifier) {
      toast.error('Identity validation failed. All fields required.')
      return
    }
    login({ email, password, organizationIdentifier: orgIdentifier })
  }

  return (
    <div className="w-full max-w-[420px] mx-auto animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-12 w-12 bg-primary rounded shadow-lg shadow-blue-500/10 flex items-center justify-center mb-6">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-outfit tracking-tighter">Login to OpsCenter</h1>
          <p className="text-muted-foreground text-sm mt-1">Access your operational intelligence dashboard.</p>
        </div>

        {/* Form Surface */}
        <div className="bg-card border border-border rounded-lg shadow-xl shadow-black/20 p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Organization ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={orgIdentifier}
                  onChange={(e) => setOrgIdentifier(e.target.value)}
                  className="input-field pl-10 h-10"
                  placeholder="e.g. acme-global"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SRE ID / Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 h-10"
                  placeholder="sre@org.corp"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access Key</label>
                <Link to="#" className="text-[10px] font-bold text-primary hover:underline">Forgot Key?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 h-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md flex items-center gap-3 text-destructive text-xs animate-in slide-in-from-top-1">
                <Key className="h-4 w-4 shrink-0" />
                <span>Identification failed. Invalid credentials or expired session.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoginLoading}
              className="btn-primary w-full h-11 mt-4"
            >
              {isLoginLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Establish Session <ArrowRight className="h-4 w-4 ml-1" /></>
              )}
            </button>
          </form>

          <div className="relative py-2">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
             <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-card px-3 text-muted-foreground tracking-tighter">Security Certified Node</span></div>
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground text-xs">
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm font-medium">
            New node cluster? {' '}
            <Link to="/register" className="text-primary font-bold hover:underline">Provision Team</Link>
          </p>
        </div>
    </div>
  )
}

export default LoginPage
