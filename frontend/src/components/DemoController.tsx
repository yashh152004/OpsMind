import React, { useState } from 'react'
import { 
  Play, 
  Settings, 
  Zap, 
  Activity, 
  Database, 
  ShieldAlert, 
  ChevronUp, 
  ChevronDown,
  Terminal,
  HelpCircle
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

const DemoController: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'SIM' | 'STEPS'>('SIM')

  const triggerSimulation = async (type: string, label: string) => {
    try {
      await apiClient.triggerSimulation(type)
      toast.success(`Demo Event: ${label} triggered successfully.`)
    } catch (e) {
      toast.error('Simulation engine offline.')
    }
  }

  const steps = [
    { title: 'Login & Auth', desc: 'Secure enterprise multi-tenant gatekeeper.' },
    { title: 'Executive Overview', desc: 'Top-level SLO/SLA & AI reasoning health.' },
    { title: 'Resource Topology', desc: 'Live infrastructure asset monitoring.' },
    { title: 'Incident Command', desc: 'Real-time triage and autonomous RCA.' },
    { title: 'Intelligence Console', desc: 'SRE Agent reasoning via LLM chains.' },
  ]

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[300] transition-all duration-500 ease-in-out",
      isOpen ? "w-80" : "w-14 h-14"
    )}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 border-4 border-white"
        >
          <Play className="h-6 w-6 fill-white" />
        </button>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Zap className="h-4 w-4 text-blue-400 fill-blue-400/20" />
               <span className="text-xs font-black text-white uppercase tracking-widest">OpsMind Demo Control</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
               <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          <div className="flex border-b border-slate-800">
             <button 
               onClick={() => setActiveTab('SIM')}
               className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-tighter transition-colors", activeTab === 'SIM' ? "text-blue-400 border-b-2 border-blue-400 bg-blue-400/5" : "text-slate-500 hover:text-slate-300")}
             >
               Inject Events
             </button>
             <button 
               onClick={() => setActiveTab('STEPS')}
               className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-tighter transition-colors", activeTab === 'STEPS' ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5" : "text-slate-500 hover:text-slate-300")}
             >
               Walkthrough
             </button>
          </div>

          <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
             {activeTab === 'SIM' ? (
                <div className="space-y-4">
                   <div className="space-y-2">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Critical Disruptions</div>
                      <div className="grid grid-cols-2 gap-2">
                         <button 
                           onClick={() => triggerSimulation('cpu_spike', 'Node CPU Spike')}
                           className="flex items-center gap-2 p-2 bg-slate-800/50 border border-slate-700/50 rounded hover:bg-slate-800 transition-colors group"
                         >
                            <Activity className="h-3.5 w-3.5 text-orange-400" />
                            <span className="text-[10px] font-bold text-slate-300">CPU Spike</span>
                         </button>
                         <button 
                           onClick={() => triggerSimulation('database_crash', 'DB Corruption')}
                           className="flex items-center gap-2 p-2 bg-slate-800/50 border border-slate-700/50 rounded hover:bg-slate-800 transition-colors group"
                         >
                            <Database className="h-3.5 w-3.5 text-red-400" />
                            <span className="text-[10px] font-bold text-slate-300">DB Failure</span>
                         </button>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Network & Edge</div>
                      <div className="grid grid-cols-2 gap-2">
                         <button 
                           onClick={() => triggerSimulation('api_latency', 'API Degradation')}
                           className="flex items-center gap-2 p-2 bg-slate-800/50 border border-slate-700/50 rounded hover:bg-slate-800 transition-colors group"
                         >
                            <Zap className="h-3.5 w-3.5 text-yellow-400" />
                            <span className="text-[10px] font-bold text-slate-300">Latency</span>
                         </button>
                         <button 
                           onClick={() => triggerSimulation('k8s_pod_crash', 'K8s OOMKill')}
                           className="flex items-center gap-2 p-2 bg-slate-800/50 border border-slate-700/50 rounded hover:bg-slate-800 transition-colors group"
                         >
                            <Terminal className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-[10px] font-bold text-slate-300">Pod Crash</span>
                         </button>
                      </div>
                   </div>

                   <div className="pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded border border-blue-500/20">
                         <HelpCircle className="h-5 w-5 text-blue-400 shrink-0" />
                         <p className="text-[10px] text-slate-400 leading-tight">
                            Events injected here will propagate to the **Alert Stream** and trigger **AI Reasoning** automatically.
                         </p>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="space-y-3">
                   {steps.map((step, i) => (
                      <div key={i} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-emerald-500/50 transition-all cursor-pointer group">
                         <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-500">
                               {i + 1}
                            </div>
                            <div>
                               <div className="text-[11px] font-bold text-white tracking-tight">{step.title}</div>
                               <div className="text-[9px] text-slate-500 font-medium">{step.desc}</div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
          
          <div className="p-3 bg-black/20 text-center">
             <span className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">Recruiter Demo Mode v1.0</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DemoController
