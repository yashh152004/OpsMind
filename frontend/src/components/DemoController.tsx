import React, { useState } from 'react'
import { 
  Play, 
  Zap, 
  Activity, 
  Database, 
  Terminal,
  HelpCircle,
  X,
  ShieldCheck,
  Bug
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { useNavigate } from 'react-router-dom'

const DemoController: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'SIM' | 'STEPS'>('STEPS')
  const navigate = useNavigate()

  const triggerSimulation = async (type: string, label: string) => {
    try {
      await apiClient.triggerSimulation(type)
      toast.success(`Demo Scenario: ${label}`, {
        description: "Event injected. Data will propagate to Dashboards, Alerts, and AI Reasoning."
      })
    } catch (e) {
      toast.error('Simulation engine offline.')
    }
  }

  const steps = [
    { title: 'Executive Overview', desc: 'SLA/SLO health & AI reasoning.', target: '/dashboard' },
    { title: 'Incident Command', desc: 'Real-time triage & RCA.', target: '/incidents' },
    { title: 'Infrastructure', desc: 'Distributed asset monitoring.', target: '/infrastructure' },
    { title: 'Alert Stream', desc: 'Live telemetry processing.', target: '/alerts' },
    { title: 'AI SRE Copilot', desc: 'Reasoning via platform state.', target: '/ai-chat' },
  ]

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[300] transition-all duration-300 ease-in-out",
      isOpen ? "w-80" : "w-12 h-12"
    )}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 border-2 border-white"
          title="Product Walkthrough"
        >
          <Play className="h-5 w-5 fill-white" />
        </button>
      ) : (
        <div className="bg-white border border-border rounded shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-3.5 bg-primary border-b border-secondary flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Activity className="h-4 w-4 text-accent" />
               <span className="text-[11px] font-bold text-white uppercase tracking-widest">Enterprise Showcase</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
               <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex border-b border-border bg-slate-50">
             <button 
                onClick={() => setActiveTab('STEPS')}
                className={cn("flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors", activeTab === 'STEPS' ? "text-accent border-b-2 border-accent bg-white" : "text-muted hover:text-primary")}
             >
               Walkthrough
             </button>
             <button 
                onClick={() => setActiveTab('SIM')}
                className={cn("flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors", activeTab === 'SIM' ? "text-accent border-b-2 border-accent bg-white" : "text-muted hover:text-primary")}
             >
               Scenario Lab
             </button>
          </div>

          <div className="p-3 max-h-[380px] overflow-y-auto scrollbar-slim">
             {activeTab === 'STEPS' ? (
                <div className="space-y-2">
                   {steps.map((step, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          navigate(step.target);
                          setIsOpen(false);
                        }}
                        className="p-3 bg-white border border-border rounded-sm hover:border-accent hover:bg-slate-50 transition-all cursor-pointer group"
                      >
                         <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-sm bg-slate-100 border border-border flex items-center justify-center text-[10px] font-bold text-muted group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-colors">
                               {i + 1}
                            </div>
                            <div>
                               <div className="text-[12px] font-bold text-primary tracking-tight">{step.title}</div>
                               <div className="text-[10px] text-muted font-medium">{step.desc}</div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="space-y-4">
                   <div className="space-y-2">
                      <div className="text-[9px] font-bold text-muted uppercase tracking-widest px-1">Infrastructure Failures</div>
                      <div className="grid grid-cols-2 gap-2">
                         <button 
                           onClick={() => triggerSimulation('cpu_spike', 'Node CPU Spike')}
                           className="flex items-center gap-2 p-2.5 bg-white border border-border rounded-sm hover:bg-red-50 hover:border-red-100 transition-colors group"
                         >
                            <Activity className="h-3.5 w-3.5 text-orange-500" />
                            <span className="text-[10px] font-bold text-secondary uppercase">CPU Spike</span>
                         </button>
                         <button 
                           onClick={() => triggerSimulation('database_crash', 'DB Corruption')}
                           className="flex items-center gap-2 p-2.5 bg-white border border-border rounded-sm hover:bg-red-50 hover:border-red-100 transition-colors group"
                         >
                            <Database className="h-3.5 w-3.5 text-critical" />
                            <span className="text-[10px] font-bold text-secondary uppercase">DB Crash</span>
                         </button>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="text-[9px] font-bold text-muted uppercase tracking-widest px-1">Network & Services</div>
                      <div className="grid grid-cols-2 gap-2">
                         <button 
                           onClick={() => triggerSimulation('api_latency', 'API Degradation')}
                           className="flex items-center gap-2 p-2.5 bg-white border border-border rounded-sm hover:bg-blue-50 hover:border-blue-100 transition-colors group"
                         >
                            <Zap className="h-3.5 w-3.5 text-warning" />
                            <span className="text-[10px] font-bold text-secondary uppercase">Latency</span>
                         </button>
                         <button 
                           onClick={() => triggerSimulation('k8s_pod_crash', 'K8s OOMKill')}
                           className="flex items-center gap-2 p-2.5 bg-white border border-border rounded-sm hover:bg-blue-50 hover:border-blue-100 transition-colors group"
                         >
                            <Terminal className="h-3.5 w-3.5 text-accent" />
                            <span className="text-[10px] font-bold text-secondary uppercase">Pod Kill</span>
                         </button>
                      </div>
                   </div>

                   <div className="space-y-2">
                       <div className="text-[9px] font-bold text-muted uppercase tracking-widest px-1">Security & Stability</div>
                       <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => triggerSimulation('security_threat', 'Brute Force Attack')}
                            className="flex items-center gap-2 p-2.5 bg-white border border-border rounded-sm hover:bg-red-50 hover:border-red-100 transition-colors group"
                          >
                             <ShieldCheck className="h-3.5 w-3.5 text-critical" />
                             <span className="text-[10px] font-bold text-secondary uppercase">Threat</span>
                          </button>
                          <button 
                            onClick={() => triggerSimulation('memory_leak', 'Memory Leak')}
                            className="flex items-center gap-2 p-2.5 bg-white border border-border rounded-sm hover:bg-yellow-50 hover:border-yellow-100 transition-colors group"
                          >
                             <Bug className="h-3.5 w-3.5 text-warning" />
                             <span className="text-[10px] font-bold text-secondary uppercase">M-Leak</span>
                          </button>
                       </div>
                    </div>

                   <div className="pt-2">
                      <div className="flex items-start gap-2.5 p-3 bg-blue-50 rounded-sm border border-blue-100">
                         <HelpCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                         <p className="text-[10px] text-secondary font-medium leading-normal">
                            Scenarios propagate end-to-end. Watch for new Alerts, Incidents, and Audit Logs.
                         </p>
                      </div>
                   </div>
                </div>
             )}
          </div>
          
          <div className="p-2.5 bg-slate-50 border-t border-border text-center">
             <span className="text-[9px] text-muted font-bold uppercase tracking-widest">Local Demonstration v2.4</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DemoController
