import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, 
  Users, 
  Cloud, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Activity,
  Terminal,
  Zap,
  Database
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'
import { apiClient } from '@/services/api'

const steps = [
  { id: 1, title: 'Identity', desc: 'Secure Organization', icon: Building2 },
  { id: 2, title: 'Teams', desc: 'SRE Access Control', icon: Users },
  { id: 3, title: 'Sources', desc: 'Connect Telemetry', icon: Cloud },
  { id: 4, title: 'Ready', desc: 'Node Activation', icon: Zap },
]

const SetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    region: 'us-east-1 (Northern Virginia)',
    planType: 'ENTERPRISE'
  })
  const navigate = useNavigate()

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsProvisioning(true)
      try {
        await apiClient.createOrganization({
          name: formData.name || 'Default Organization',
          planType: formData.planType
        })
        toast.success("Infrastructure provisioned. Identity confirmed.")
        navigate('/dashboard')
      } catch (err) {
        toast.error("Cloud provisioning failed. Identity engine timed out.")
      } finally {
        setIsProvisioning(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid lg:grid-cols-[1fr,2fr] gap-0 enterprise-card overflow-hidden h-[600px]">
        {/* Progress Sidebar */}
        <div className="bg-slate-900 border-r border-slate-800 p-8 space-y-12 text-slate-400">
          <div>
            <div className="h-10 w-10 bg-primary rounded flex items-center justify-center text-white font-bold text-xl mb-4">
              O
            </div>
            <h1 className="font-outfit font-bold text-xl text-white">Cloud Ingress</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-black">SaaS Orchestration</p>
          </div>

          <div className="space-y-6">
            {steps.map(step => (
              <div key={step.id} className="flex items-center gap-4 group">
                <div className={cn(
                  "h-8 w-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-all",
                  currentStep === step.id ? "border-primary text-primary bg-primary/10" : 
                  currentStep > step.id ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-800 text-slate-600"
                )}>
                  {currentStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                </div>
                <div>
                   <div className={cn("text-xs font-black uppercase tracking-[0.2em]", currentStep >= step.id ? "text-white" : "text-slate-600")}>{step.title}</div>
                   <div className="text-[10px] text-slate-500 font-medium">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-12 flex flex-col justify-between bg-white text-primary">
          {currentStep === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <h2 className="text-2xl font-black flex items-center gap-3 italic">
                   <Shield className="h-6 w-6 text-primary" /> Multi-tenant Identity
                 </h2>
                 <p className="text-sm text-muted font-medium">Assign a globally unique identifier for your organization cluster.</p>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted uppercase tracking-widest">Organization Identifier</label>
                     <input 
                       type="text" 
                       placeholder="e.g. acme-engineering-us" 
                       className="input-field h-11" 
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted uppercase tracking-widest">Billing Region</label>
                     <select 
                       className="input-field h-11 cursor-pointer"
                       value={formData.region}
                       onChange={e => setFormData({...formData, region: e.target.value})}
                     >
                        <option>us-east-1 (Northern Virginia)</option>
                        <option>eu-central-1 (Frankfurt)</option>
                     </select>
                  </div>
               </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <h2 className="text-2xl font-black flex items-center gap-3 italic">
                   <Users className="h-6 w-6 text-primary" /> Engineering Units
                 </h2>
                 <p className="text-sm text-muted font-medium">Provision RBAC groups for your SRE and DevOps teams.</p>
               </div>
               <div className="space-y-3">
                  {['Core SRE Team', 'Security Compliance', 'Feature Engineers'].map(team => (
                    <div key={team} className="flex items-center justify-between p-4 bg-slate-50 border border-border rounded-[2px] hover:border-primary transition-all">
                       <span className="text-xs font-black uppercase tracking-widest">{team}</span>
                       <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-sm">Full Read/Write</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <h2 className="text-2xl font-black flex items-center gap-3 italic">
                   <Cloud className="h-6 w-6 text-primary" /> Connectivity Matrix
                 </h2>
                 <p className="text-sm text-muted font-medium">Attach your existing monitoring infrastructure to the OpsMind Ingress.</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'CloudWatch', icon: Activity },
                    { name: 'Prometheus', icon: Terminal },
                    { name: 'Kubernetes', icon: Shield },
                    { name: 'Datadog Sink', icon: Database }
                  ].map(src => (
                    <div key={src.name} className="p-4 border border-border rounded-[2px] hover:border-primary cursor-pointer transition-all flex items-center gap-3 group">
                       <src.icon className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{src.name}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-300 h-full">
               <div className="h-20 w-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-500 shadow-inner">
                  <CheckCircle2 className="h-10 w-10" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-2xl font-black italic">Orchestration Ready</h2>
                 <p className="text-sm text-muted font-medium max-w-sm">Your cluster identity has been verified. Data streams are ready to be ingested in {formData.region.split(' ')[0]}.</p>
               </div>
               <div className="w-full bg-[#0F172A] p-5 rounded-[2px] border border-slate-800 text-left font-mono text-[10px] text-slate-400 shadow-2xl">
                  <div className="text-primary mb-1"># Authentication Token Provisioned</div>
                  <div>$ export OPSMIND_TOKEN=live_{Math.random().toString(36).substring(7).toUpperCase()}</div>
                  <div className="mt-2 text-primary"># Heartbeat Connectivity</div>
                  <div>$ curl -X POST https://api.opsmind.ai/v1/heartbeat</div>
               </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-8 border-t border-border mt-auto">
             <button disabled={currentStep === 1 || isProvisioning} onClick={() => setCurrentStep(prev => prev - 1)} className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary disabled:opacity-30">
               Previous
             </button>
             <button onClick={handleNext} disabled={isProvisioning} className="btn-primary h-11 px-10 text-[10px] font-black uppercase tracking-widest italic group shadow-xl">
               {isProvisioning ? (
                 <Activity className="h-4 w-4 animate-spin" />
               ) : (
                 <>{currentStep === 4 ? 'Activate Console' : 'Continue Step'} <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" /></>
               )}
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}


export default SetupWizard
