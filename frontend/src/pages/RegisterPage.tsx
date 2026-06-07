import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { toast } from 'sonner'
import { Activity, Shield, Mail, ArrowRight, Loader2, User, Building } from 'lucide-react'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register, isRegisterLoading, registerError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    orgIdentifier: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password || !formData.firstName || !formData.orgIdentifier) {
      toast.error('Identity creation failed. All mandatory fields required.')
      return
    }
    register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      organizationIdentifier: formData.orgIdentifier
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="w-full max-w-[480px] mx-auto animate-fade-in py-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="h-10 w-10 bg-primary rounded shadow-lg flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-outfit tracking-tighter">Provision Node Cluster</h1>
          <p className="text-muted-foreground text-xs mt-1">Deploy an enterprise intelligence environment in minutes.</p>
        </div>

        {/* Form Surface */}
        <div className="bg-card border border-border rounded-lg shadow-xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    name="firstName"
                    type="text"
                    onChange={handleChange}
                    className="input-field pl-10 h-10"
                    placeholder="SRE Name"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  onChange={handleChange}
                  className="input-field h-10"
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Organization ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Building className="h-4 w-4" />
                </div>
                <input
                  name="orgIdentifier"
                  type="text"
                  onChange={handleChange}
                  className="input-field pl-10 h-10"
                  placeholder="e.g. acme-engineering"
                />
              </div>
              <p className="text-[9px] text-muted-foreground/60 px-1 font-medium">This will be your dedicated multi-tenant namespace.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Corporate Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  name="email"
                  type="email"
                  onChange={handleChange}
                  className="input-field pl-10 h-10"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access Key (Password)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                </div>
                <input
                  name="password"
                  type="password"
                  onChange={handleChange}
                  className="input-field pl-10 h-10"
                  placeholder="Min 8 characters"
                />
              </div>
            </div>

            {registerError && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md text-destructive text-xs animate-in slide-in-from-top-1">
                Cluster provisioning failed: Identity conflict detected.
              </div>
            )}

            <button
              type="submit"
              disabled={isRegisterLoading}
              className="btn-primary w-full h-11 mt-6"
            >
              {isRegisterLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Deploy Cluster <ArrowRight className="h-4 w-4 ml-1" /></>
              )}
            </button>
          </form>

          <footer className="pt-4 text-center">
             <p className="text-[10px] text-muted-foreground font-medium flex items-center justify-center gap-1">
               <Shield className="h-3 w-3" /> GDPR & SOC2 Compliance Policy Included
             </p>
          </footer>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm font-medium">
            Already have a cluster? {' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Access Session</Link>
          </p>
        </div>
    </div>
  )
}

export default RegisterPage
