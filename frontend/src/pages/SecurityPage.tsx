import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  ShieldAlert, 
  Lock, 
  Eye, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  History
} from 'lucide-react'
import { cn } from '@/utils/cn'

const SecurityPage: React.FC = () => {
  const { data: findings, isLoading } = useQuery({
    queryKey: ['security-findings'],
    queryFn: () => apiClient.getSecurityFindings()
  })

  return (
    <div className="space-y-8 pb-20 page-transition">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
             <ShieldCheck className="h-6 w-6 text-blue-600" /> Security Posture
          </h1>
          <p className="text-muted-foreground text-sm font-medium">Monitoring distributed vulnerabilities, compliance gaps, and access anomalies.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <button className="btn-secondary h-10 text-xs flex-1 md:flex-none justify-center">Compliance Report</button>
           <button className="btn-primary h-10 text-xs flex-1 md:flex-none justify-center">Run Deep Scan</button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
         <div className="enterprise-card p-6 border-l-4 border-l-destructive hover:bg-destructive/[0.02] transition-colors">
            <div className="text-destructive flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-4">
               <ShieldAlert className="h-4 w-4" /> Critical Risks
            </div>
            <div className="text-3xl font-bold font-mono">{findings?.filter((f:any) => f.severity === 'HIGH').length || 0}0</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tighter">Requires immediate remediation</p>
         </div>
         <div className="enterprise-card p-6 border-l-4 border-l-primary hover:bg-primary/[0.02] transition-colors">
            <div className="text-primary flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-4">
               <Lock className="h-4 w-4" /> IAM Policies
            </div>
            <div className="text-3xl font-bold font-mono">142</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tighter">Scanned across cluster nodes</p>
         </div>
         <div className="enterprise-card p-6 border-l-4 border-l-emerald-500 hover:bg-emerald-500/[0.02] transition-colors sm:col-span-2 lg:col-span-1">
            <div className="text-emerald-500 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-4">
               <History className="h-4 w-4" /> MTTR (Security)
            </div>
            <div className="text-3xl font-bold font-mono">4.2h</div>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-tighter">Time to mitigate vulnerabilities</p>
         </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
         {/* Live Finding Stream */}
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <Activity className="h-4 w-4" /> Active Vulnerabilities
            </h3>
            <div className="enterprise-card divide-y divide-border">
               {isLoading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-20 skeleton" />)
               ) : findings?.map((finding: any) => (
                  <div key={finding.id} className="p-4 flex items-center justify-between group transition-colors hover:bg-accent/10">
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 border rounded flex items-center justify-center",
                          finding.severity === 'HIGH' ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-primary/10 border-primary/20 text-primary"
                        )}>
                           <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                           <div className="text-sm font-bold">{finding.title}</div>
                           <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-2 mt-1">
                              {finding.category} | {finding.resourceId}
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-muted-foreground">Discovered {new Date(finding.discoveredAt).toLocaleDateString()}</span>
                        <button className="btn-ghost p-1.5"><ArrowRight className="h-4 w-4" /></button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Scan History / Policy */}
         <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <ShieldCheck className="h-4 w-4" /> Policy Compliance
            </h3>
            <div className="enterprise-card p-6 space-y-6">
               {[
                 { label: 'SOX Compliance', val: 92 },
                 { label: 'PCI DSS 4.0', val: 78 },
                 { label: 'GDPR Privacy', val: 100 },
               ].map(pol => (
                 <div key={pol.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                       <span>{pol.label}</span>
                       <span className={pol.val === 100 ? "text-emerald-500" : "text-primary"}>{pol.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                       <div 
                         className={cn("h-full", pol.val === 100 ? "bg-emerald-500" : "bg-primary")} 
                         style={{ width: `${pol.val}%` }} 
                       />
                    </div>
                 </div>
               ))}
               <div className="pt-4 border-t border-border">
                  <button className="btn-secondary w-full h-10 text-xs gap-2">
                     <Eye className="h-4 w-4" /> View Full Audit Log
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

export default SecurityPage
