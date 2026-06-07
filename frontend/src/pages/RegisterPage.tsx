import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { toast } from 'sonner'
import { Activity, Mail, Lock, User, Building, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register, isRegisterLoading, registerError } = useAuth()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    register(formData)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[540px] z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-16 w-16 rounded-2xl premium-gradient flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold font-outfit tracking-tight mb-2">Scale Your SRE Team</h1>
          <p className="text-muted-foreground font-medium">Join 500+ enterprises using OpsMind for predictive observability.</p>
        </div>

        <div className="glass-card p-10 border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    className="input-field pl-12"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Organization Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Building className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  className="input-field pl-12"
                  placeholder="Acme Global Inc."
                  value={formData.organizationName}
                  onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Business Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="input-field pl-12"
                  placeholder="john@acme.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field pl-12"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirm</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            {registerError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-200 text-sm flex items-center gap-2">
                 <Lock className="h-4 w-4 text-red-500" />
                 <span>Registration failed. Email might be already in use.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isRegisterLoading}
              className="btn-primary w-full h-12 mt-4"
            >
              {isRegisterLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Initialize OpsCenter <ArrowRight className="h-5 w-5 ml-1" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-6">
             <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> SOC2 Compliant
             </div>
             <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> GDPR Ready
             </div>
             <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> SSL Encrypted
             </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm font-medium">
            Already have an account? {' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Access Terminal</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
