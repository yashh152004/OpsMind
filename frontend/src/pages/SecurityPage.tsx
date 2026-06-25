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
import { toast } from 'sonner'

const SecurityPage: React.FC = () => {
  const [isScanning, setIsScanning] = React.useState(false)
  const { data: findings, isLoading, refetch } = useQuery({
    queryKey: ['security-findings'],
    queryFn: () => apiClient.getSecurityFindings()
  })

  const handleDeepScan = async () => {
     setIsScanning(true)
     toast.promise(
       new Promise((resolve) => setTimeout(resolve, 2000)),
       {
         loading: 'Orchestrating deep vulnerability scan...',
         success: () => {
           setIsScanning(false)
           refetch()
           return 'Security scan finalized. 2 new CVE-2024 patterns identified.'
         },
         error: 'Security orchestration engine timed out.'
       }
     )
  }

  return (
    <div className="main-content-grid page-transition-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-page-title">Security Posture</h1>
          <p className="text-helper font-medium">Monitoring vulnerabilities, compliance gaps, and access anomalies across your infrastructure.</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="btn-secondary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">Compliance Report</button>
           <button 
             onClick={handleDeepScan}
             disabled={isScanning}
             className="btn-primary h-8 px-3 text-[11px] font-bold uppercase tracking-wider disabled:opacity-50">
             {isScanning ? 'Scanning...' : 'Deep Scan'}
           </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         <div className="enterprise-card p-4 hover-lift">
            <div className="flex justify-between items-start mb-2">
               <span className="text-metric-label">High Risk Findings</span>
               <ShieldAlert className="h-4 w-4 text-critical" />
            </div>
            <div className="text-2xl metric-value text-critical">{findings?.filter((f:any) => f.severity === 'HIGH').length || 0}</div>
            <p className="text-[10px] text-muted mt-2 font-bold uppercase tracking-wider">Requires immediate remediation</p>
         </div>
         <div className="enterprise-card p-4 hover-lift">
            <div className="flex justify-between items-start mb-2">
               <span className="text-metric-label">IAM Policies Audited</span>
               <Lock className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl metric-value">142</div>
            <p className="text-[10px] text-muted mt-2 font-bold uppercase tracking-wider">Across active cluster nodes</p>
         </div>
         <div className="enterprise-card p-4 hover-lift sm:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start mb-2">
               <span className="text-metric-label">Security MTTR</span>
               <History className="h-4 w-4 text-success" />
            </div>
            <div className="text-2xl metric-value text-success">4.2h</div>
            <p className="text-[10px] text-muted mt-2 font-bold uppercase tracking-wider">Mean time to recovery</p>
         </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
         {/* Live Finding Stream */}
         <div className="lg:col-span-2 space-y-4">
            <h3 className="text-section-title flex items-center gap-2 px-1">
               <Activity className="h-3.5 w-3.5" /> Recent Findings
            </h3>
            <div className="enterprise-card divide-y divide-border/50">
               {isLoading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-16 animate-pulse bg-slate-50" />)
               ) : findings?.map((finding: any) => (
                  <div key={finding.id} className="p-4 flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-9 w-9 rounded-sm border flex items-center justify-center",
                          finding.severity === 'HIGH' ? "bg-red-50 border-red-100 text-critical" : "bg-blue-50 border-blue-100 text-accent"
                        )}>
                           <AlertTriangle className="h-4.5 w-4.5" />
                        </div>
                        <div>
                           <div className="text-[13px] font-bold text-primary">{finding.title}</div>
                           <div className="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-2 mt-0.5">
                              {finding.category} • {finding.resourceId}
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <span className="text-[11px] font-medium text-muted font-mono hidden md:block">Discovered: {new Date(finding.discoveredAt).toLocaleDateString()}</span>
                        <button className="btn-ghost" title="View Detail"><ArrowRight className="h-4 w-4" /></button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Compliance HUD */}
         <div className="space-y-4">
            <h3 className="text-section-title flex items-center gap-2 px-1">
               <ShieldCheck className="h-3.5 w-3.5" /> Compliance HUD
            </h3>
            <div className="enterprise-card p-5 space-y-6">
               {[
                 { label: 'SOX Compliance', val: 92, status: 'warning' },
                 { label: 'PCI DSS 4.0', val: 78, status: 'warning' },
                 { label: 'GDPR Privacy', val: 100, status: 'success' },
               ].map(pol => (
                 <div key={pol.label} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                       <span className="text-muted">{pol.label}</span>
                       <span className={cn(pol.status === 'success' ? "text-success" : "text-primary")}>{pol.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={cn("h-full transition-all duration-1000", pol.status === 'success' ? "bg-success" : "bg-accent")} 
                         style={{ width: `${pol.val}%` }} 
                       />
                    </div>
                 </div>
               ))}
               <div className="pt-4 border-t border-border mt-4">
                  <button className="btn-secondary w-full h-9 text-[11px] font-bold uppercase tracking-wider">
                     <Eye className="h-4 w-4 mr-2" /> Audit History
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}


export default SecurityPage
