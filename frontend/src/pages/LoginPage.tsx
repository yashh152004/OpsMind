import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { toast } from 'sonner'
import { Activity, Shield, Lock, Mail, ArrowRight, Loader2, Key } from 'lucide-react'

const LoginPage: React.FC = () => {
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
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tighter">OpsMind Intelligence</h1>
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
              <div className="bg-critical/10 border border-critical/20 p-3 rounded-md flex items-center gap-3 text-critical text-xs animate-in slide-in-from-top-1">
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

          <div className="relative flex py-1 items-center">
             <div className="flex-grow border-t border-border"></div>
             <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">or</span>
             <div className="flex-grow border-t border-border"></div>
          </div>

          <button
            onClick={() => {
              window.location.href = `${window.location.origin}/api/oauth2/authorization/google`
            }}
            type="button"
            className="w-full h-11 border border-border bg-transparent hover:bg-secondary text-foreground font-semibold text-sm rounded-[var(--radius)] flex items-center justify-center transition-all duration-150 active:scale-[0.99] focus:outline-none"
          >
            <svg className="h-4 w-4 mr-2 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

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
