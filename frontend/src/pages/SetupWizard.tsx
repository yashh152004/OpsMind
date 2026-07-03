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
      <div className="w-full max-w-4xl grid lg:grid-cols-[1fr,2fr] gap-0 border border-border rounded-xl overflow-hidden h-[600px] shadow-2xl">
        {/* Progress Sidebar */}
        <div className="bg-black border-r border-border-strong p-8 space-y-12 text-neutral-400">
          <div>
            <div className="h-10 w-10 bg-white rounded flex items-center justify-center text-black font-black text-xl mb-4">
              O
            </div>
            <h1 className="font-outfit font-black text-xl text-white italic">Cloud Ingress</h1>
            <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-[0.2em] font-black">SaaS Orchestration</p>
          </div>

          <div className="space-y-6">
            {steps.map(step => (
              <div key={step.id} className="flex items-center gap-4 group">
                <div className={cn(
                  "h-8 w-8 rounded-full border-2 flex items-center justify-center text-[11px] font-black transition-all",
                  currentStep === step.id ? "border-white text-black bg-white" : 
                  currentStep > step.id ? "border-emerald-500 bg-emerald-500 text-white" : "border-neutral-800 text-neutral-600"
                )}>
                  {currentStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                </div>
                <div>
                   <div className={cn("text-[11px] font-black uppercase tracking-[0.2em]", currentStep >= step.id ? "text-white" : "text-neutral-700")}>{step.title}</div>
                   <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-12 flex flex-col justify-between bg-surface text-foreground relative overflow-hidden">
          {currentStep === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <h2 className="text-3xl font-black flex items-center gap-3 italic tracking-tighter">
                   <Shield className="h-7 w-7 text-foreground" /> Multi-tenant Identity
                 </h2>
                 <p className="text-sm text-secondary font-bold">Assign a globally unique identifier for your organization cluster.</p>
               </div>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[11px] font-black text-foreground uppercase tracking-widest">Organization Identifier</label>
                     <input 
                       type="text" 
                       placeholder="e.g. acme-engineering-us" 
                       className="input-enterprise h-12" 
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[11px] font-black text-foreground uppercase tracking-widest">Billing Region</label>
                     <select 
                       className="input-enterprise h-12 cursor-pointer appearance-none bg-surface-alt"
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
                 <h2 className="text-3xl font-black flex items-center gap-3 italic tracking-tighter">
                   <Users className="h-7 w-7 text-foreground" /> Engineering Units
                 </h2>
                 <p className="text-sm text-secondary font-bold">Provision RBAC groups for your SRE and DevOps teams.</p>
               </div>
               <div className="space-y-3">
                  {['Core SRE Team', 'Security Compliance', 'Feature Engineers'].map(team => (
                    <div key={team} className="flex items-center justify-between p-4 bg-surface-alt border border-border rounded-lg hover:border-foreground transition-all">
                       <span className="text-[12px] font-black uppercase tracking-widest">{team}</span>
                       <span className="px-2.5 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded">Full Read/Write</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <h2 className="text-3xl font-black flex items-center gap-3 italic tracking-tighter">
                   <Cloud className="h-7 w-7 text-foreground" /> Connectivity Matrix
                 </h2>
                 <p className="text-sm text-secondary font-bold">Attach your existing monitoring infrastructure to the OpsMind Ingress.</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'CloudWatch', icon: Activity },
                    { name: 'Prometheus', icon: Terminal },
                    { name: 'Kubernetes', icon: Shield },
                    { name: 'Datadog Sink', icon: Database }
                  ].map(src => (
                    <div key={src.name} className="p-5 border border-border rounded-lg hover:border-foreground hover:bg-surface-alt cursor-pointer transition-all flex flex-col gap-4 group">
                       <div className="h-10 w-10 bg-surface-alt border border-border rounded-md flex items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-background">
                          <src.icon className="h-5 w-5" />
                       </div>
                       <span className="text-[11px] font-black uppercase tracking-widest">{src.name}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-300 h-full">
               <div className="h-20 w-20 rounded-full bg-surface-alt border-[6px] border-border flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 className="h-10 w-10" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-3xl font-black italic tracking-tighter">Orchestration Ready</h2>
                 <p className="text-sm text-secondary font-bold max-w-sm">Your cluster identity has been verified. Data streams are ready for ingestion.</p>
               </div>
               <div className="w-full bg-black p-6 rounded-xl border border-border-strong text-left font-mono text-[11px] text-neutral-400 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <div className="text-white mb-2 font-black uppercase tracking-[0.1em]"># Provisioning Shard Artifacts</div>
                  <div className="text-emerald-500">$ export OPSMIND_TOKEN=live_{Math.random().toString(36).substring(7).toUpperCase()}</div>
                  <div className="mt-3 text-white font-black uppercase tracking-[0.1em]"># Validating Ingress Heartbeat</div>
                  <div className="text-emerald-500">$ curl -X POST https://api.opsmind.ai/v1/heartbeat</div>
               </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-8 border-t border-border mt-auto">
             <button disabled={currentStep === 1 || isProvisioning} onClick={() => setCurrentStep(prev => prev - 1)} className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary hover:text-foreground disabled:opacity-20 transition-all">
               Back
             </button>
             <button onClick={handleNext} disabled={isProvisioning} className="h-12 px-10 bg-black text-white rounded-lg text-[11px] font-black uppercase tracking-[0.2em] italic group shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
               {isProvisioning ? (
                 <Activity className="h-4 w-4 animate-spin" />
               ) : (
                 <div className="flex items-center gap-2">
                    {currentStep === 4 ? 'Activate Console' : 'Next Protocol'} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                 </div>
               )}
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SetupWizard
