import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  ShieldAlert, Lock, Eye, Activity, ChevronRight,
  ShieldCheck, AlertTriangle, History
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

const SecurityPage: React.FC = () => {
  const [isScanning, setIsScanning] = React.useState(false)
  const { data: findings, isLoading, refetch } = useQuery({
    queryKey: ['security-findings'],
    queryFn: () => apiClient.getSecurityFindings()
  })

  const handleDeepScan = async () => {
     setIsScanning(true)
     try {
       const result = await apiClient.performSecurityScan()
       toast.success('Security scan finalized.', {
          description: `${result.findings_count} patterns identified.`
       })
       refetch()
     } catch (err) {
       toast.error('Security orchestration engine timed out.')
     } finally {
       setIsScanning(false)
     }
  }

  return (
    <div className="page-transition-fade space-y-6 p-6 lg:p-8 bg-background min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-border">
        <div className="space-y-1 text-left">
           <h1 className="text-[32px] font-bold tracking-tight text-foreground m-0 leading-tight">Security Posture</h1>
           <div className="flex items-center gap-2.5">
              <span className="badge-enterprise bg-surface-alt border border-border py-0.5">
                 <ShieldCheck className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                 Active Policy HUD
              </span>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted-foreground">
                 Monitoring vulnerabilities, compliance gaps, and access anomalies across global meshes.
              </p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="btn-secondary h-8.5 px-3">Compliance Report</button>
           <button 
             onClick={handleDeepScan}
             disabled={isScanning}
             className="btn-primary h-8.5 px-3">
             {isScanning ? 'Scanning...' : 'Deep Scan'}
           </button>
        </div>
      </div>

      {/* Top Cards matrix */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         <div className="card-enterprise p-5 group hover:bg-surface-hover transition-all text-left">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">High Risk Findings</span>
               <div className="h-8 w-8 bg-red-950/20 border border-red-900/30 text-red-500 rounded flex items-center justify-center">
                  <ShieldAlert className="h-4.5 w-4.5" />
               </div>
            </div>
            <div className="text-[22px] font-bold text-red-500 tracking-tight leading-none">
               {findings?.filter((f:any) => f.severity === 'HIGH').length || 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 tracking-wide">Requires immediate operational patching</p>
         </div>

         <div className="card-enterprise p-5 group hover:bg-surface-hover transition-all text-left">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">IAM Policies Audited</span>
               <div className="h-8 w-8 bg-surface-alt border border-border text-foreground rounded flex items-center justify-center">
                  <Lock className="h-4.5 w-4.5 text-muted-foreground" />
               </div>
            </div>
            <div className="text-[22px] font-bold text-foreground tracking-tight leading-none">142</div>
            <p className="text-[11px] text-muted-foreground mt-2 tracking-wide">Across active shard namespaces</p>
         </div>

         <div className="card-enterprise p-5 group hover:bg-surface-hover transition-all text-left sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start mb-4">
               <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Security MTTR</span>
               <div className="h-8 w-8 bg-emerald-950/20 border border-emerald-900/30 text-emerald-500 rounded flex items-center justify-center">
                  <History className="h-4.5 w-4.5" />
               </div>
            </div>
            <div className="text-[22px] font-bold text-emerald-500 tracking-tight leading-none">4.2h</div>
            <p className="text-[11px] text-muted-foreground mt-2 tracking-wide">Average operational cycle length</p>
         </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
         {/* Live Finding Stream */}
         <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5 text-left">
               <h3 className="text-[16px] font-semibold text-foreground m-0 flex items-center gap-1.5 uppercase tracking-wide">
                  <Activity className="h-4 w-4 text-muted-foreground" /> Recent Findings
               </h3>
            </div>
            <div className="table-container">
               <table className="table-enterprise">
                  <tbody>
                     {isLoading ? (
                        Array(3).fill(0).map((_, i) => (
                           <tr key={i}><td className="py-8"><div className="h-5 skeleton-ui w-full opacity-80 mx-auto rounded animate-pulse" /></td></tr>
                        ))
                     ) : findings?.map((finding: any) => (
                        <tr key={finding.id} className="group hover:bg-surface-hover/50">
                           <td className="w-14 py-3.5 pr-0 text-center">
                              <div className={cn(
                                "h-8.5 w-8.5 rounded-[var(--radius)] border flex items-center justify-center mx-auto",
                                finding.severity === 'HIGH'
                                 ? "bg-red-950/20 text-red-500 border-red-900/30" 
                                 : "bg-surface-alt text-muted-foreground border-border"
                              )}>
                                 <AlertTriangle className="h-4.5 w-4.5" />
                              </div>
                           </td>
                           <td>
                              <div className="flex flex-col text-left">
                                 <span className="text-[13px] font-semibold text-foreground group-hover:underline">{finding.title}</span>
                                 <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                                    {finding.category} <span className="opacity-60 mx-1">•</span> <span className="lowercase font-mono">{finding.resourceId}</span>
                                 </span>
                              </div>
                           </td>
                           <td>
                              <div className="text-[11px] font-semibold text-muted-foreground font-mono text-right">
                                 {new Date(finding.discoveredAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                              </div>
                           </td>
                           <td className="w-12 text-right pr-4">
                              <button className="btn-secondary h-8 w-8 p-0 flex items-center justify-center">
                                 <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Compliance HUD */}
         <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5 text-left">
               <h3 className="text-[16px] font-semibold text-foreground m-0 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Compliance HUD
               </h3>
            </div>
            <div className="card-enterprise p-5 space-y-5 text-left">
               {[
                 { label: 'SOX Compliance', val: 92, status: 'warning' },
                 { label: 'PCI DSS 4.0', val: 78, status: 'warning' },
                 { label: 'GDPR Privacy', val: 100, status: 'success' },
               ].map(pol => (
                 <div key={pol.label} className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                       <span className="text-muted-foreground">{pol.label}</span>
                       <span className={cn(pol.status === 'success' ? "text-emerald-500" : "text-foreground")}>{pol.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border/80">
                       <div 
                         className={cn("h-full transition-all duration-1000", pol.status === 'success' ? "bg-emerald-500" : "bg-foreground")} 
                         style={{ width: `${pol.val}%` }} 
                       />
                    </div>
                 </div>
               ))}
               <div className="pt-3 border-t border-border">
                  <button className="btn-secondary w-full h-8.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                     <Eye className="h-3.5 w-3.5 text-muted-foreground" /> Audit History
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

export default SecurityPage
