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
  Zap
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

const steps = [
  { id: 1, title: 'Identity', desc: 'Secure Organization', icon: Building2 },
  { id: 2, title: 'Teams', desc: 'SRE Access Control', icon: Users },
  { id: 3, title: 'Sources', desc: 'Connect Telemetry', icon: Cloud },
  { id: 4, title: 'Ready', desc: 'Node Activation', icon: Zap },
]

const SetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    } else {
      toast.success("Infrastructure provisioned successfully. Entering Console.")
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid lg:grid-cols-[1fr,2fr] gap-0 enterprise-card overflow-hidden h-[600px]">
        {/* Progress Sidebar */}
        <div className="bg-accent/20 border-r border-border p-8 space-y-12">
          <div>
            <div className="h-10 w-10 bg-primary rounded flex items-center justify-center text-white font-bold text-xl mb-4">
              O
            </div>
            <h1 className="font-outfit font-bold text-xl">Cloud Ingress</h1>
            <p className="text-xs text-muted-foreground mt-1">SaaS Provisioning Wizard</p>
          </div>

          <div className="space-y-6">
            {steps.map(step => (
              <div key={step.id} className="flex items-center gap-4 group">
                <div className={cn(
                  "h-8 w-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-all",
                  currentStep === step.id ? "border-primary text-primary bg-primary/10" : 
                  currentStep > step.id ? "border-emerald-500 bg-emerald-500 text-white" : "border-border text-muted-foreground"
                )}>
                  {currentStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                </div>
                <div>
                   <div className={cn("text-xs font-bold uppercase tracking-widest", currentStep >= step.id ? "text-foreground" : "text-muted-foreground")}>{step.title}</div>
                   <div className="text-[10px] text-muted-foreground">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-12 flex flex-col justify-between bg-card text-foreground">
          {currentStep === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <h2 className="text-2xl font-bold flex items-center gap-3">
                   <Shield className="h-6 w-6 text-primary" /> Multi-tenant Identity
                 </h2>
                 <p className="text-sm text-muted-foreground">Assign a globally unique identifier for your organization cluster.</p>
               </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-muted-foreground uppercase">Organization Identifier</label>
                     <input type="text" placeholder="e.g. acme-engineering-us" className="input-field h-11" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-muted-foreground uppercase">Billing Region</label>
                     <select className="input-field h-11">
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
                 <h2 className="text-2xl font-bold flex items-center gap-3">
                   <Users className="h-6 w-6 text-primary" /> Engineering Units
                 </h2>
                 <p className="text-sm text-muted-foreground">Provision RBAC groups for your SRE and DevOps teams.</p>
               </div>
               <div className="space-y-3">
                  {['Core SRE Team', 'Security Compliance', 'Feature Engineers'].map(team => (
                    <div key={team} className="flex items-center justify-between p-4 bg-accent/40 rounded border border-border">
                       <span className="text-sm font-bold">{team}</span>
                       <span className="status-badge badge-info">Write Access</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <h2 className="text-2xl font-bold flex items-center gap-3">
                   <Cloud className="h-6 w-6 text-primary" /> Connectivity Matrix
                 </h2>
                 <p className="text-sm text-muted-foreground">Attach your existing monitoring infrastructure to the OpsMind Ingress.</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'CloudWatch', icon: Activity },
                    { name: 'Prometheus', icon: Terminal },
                    { name: 'Kubernetes', icon: Shield },
                    { name: 'Logstash', icon: Database }
                  ].map(src => (
                    <div key={src.name} className="p-4 border border-border rounded-lg hover:border-primary cursor-pointer transition-all flex items-center gap-3">
                       <src.icon className="h-5 w-5 text-muted-foreground" />
                       <span className="text-xs font-bold uppercase">{src.name}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-300 h-full">
               <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="h-10 w-10" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-2xl font-bold">Node Activation</h2>
                 <p className="text-sm text-muted-foreground max-w-sm">Your cluster identity has been verified. Data streams are ready to be ingested in us-east-1.</p>
               </div>
               <div className="w-full bg-accent/20 p-4 rounded-md border border-border text-left font-mono text-[10px] text-muted-foreground">
                  $ export OPSMIND_TOKEN=live_**********************<br/>
                  $ curl -X POST https://api.opsmind.ai/v1/heartbeat
               </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-8 border-t border-border">
             <button disabled={currentStep === 1} onClick={() => setCurrentStep(prev => prev - 1)} className="text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-30">
               Previous
             </button>
             <button onClick={handleNext} className="btn-primary h-11 px-8 text-xs">
               {currentStep === 4 ? 'Enter Console' : 'Continue'} <ArrowRight className="h-4 w-4 ml-2" />
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Database } from 'lucide-react'
export default SetupWizard
