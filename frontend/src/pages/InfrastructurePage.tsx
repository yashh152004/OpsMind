import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Database, Server, ShieldCheck, Activity, Search,
  AlertTriangle, Download, RefreshCcw, Globe, Cpu, Radio, ChevronRight
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

const InfrastructurePage: React.FC = () => {
  const [isScanning, setIsScanning] = React.useState(false)
  const { data: assets, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['infra-assets'],
    queryFn: () => apiClient.getInfrastructureAssets(),
    refetchInterval: 30000
  })

  const handleScan = async () => {
    setIsScanning(true)
    try {
      const result = await apiClient.performInfrastructureScan()
      toast.success(`${result.nodes_discovered} active nodes identified.`)
      refetch()
    } catch (err) {
      toast.error('Automated cluster scan failed.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleExport = async () => {
    try {
      const blob = await apiClient.exportModule('infrastructure');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OpsMind_Infra_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      toast.success('Inventory audit exported.');
    } catch (err) {
      toast.error('Export engine failure.');
    }
  }

  return (
    <div className="page-transition-fade space-y-6 p-6 lg:p-8 bg-background min-h-screen">
      {/* Infrastructure Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-border">
        <div className="space-y-1 text-left">
           <h1 className="text-[32px] font-bold tracking-tight text-foreground m-0 leading-tight">Infrastructure Inventory</h1>
           <div className="flex items-center gap-2.5">
              <span className="badge-enterprise bg-surface-alt border border-border py-0.5">
                 <Globe className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                 Global Mesh
              </span>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted-foreground">
                 Managing <span className="text-foreground font-semibold">{assets?.length || 0} production nodes</span> across multi-cloud regions.
              </p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleExport} className="btn-secondary h-8.5 px-3">
              <Download className="h-4 w-4" />
              <span>Inventory Audit</span>
           </button>
           <button onClick={handleScan} disabled={isScanning} className="btn-primary h-8.5 px-3">
              {isScanning ? <RefreshCcw className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />}
              <span>Cluster Scan</span>
           </button>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Active Managed Nodes', val: assets?.length || '14', icon: Cpu, trend: 'Nominal' },
          { label: 'Network Latency', val: '1.4ms', icon: Activity, trend: 'Fast' },
          { label: 'Resource Hazards', val: assets?.filter((a:any) => a.status !== 'HEALTHY').length || '0', icon: AlertTriangle, trend: 'Stable' },
          { label: 'Mesh Topology State', val: 'Verified', icon: ShieldCheck, trend: 'Active' },
        ].map(kpi => (
          <div key={kpi.label} className="card-enterprise p-5 flex flex-col justify-between group hover:bg-surface-hover transition-all text-left">
            <div className="flex justify-between items-start">
               <div className="h-8.5 w-8.5 bg-surface-alt border border-border rounded flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-colors">
                  <kpi.icon className="h-4.5 w-4.5 text-muted-foreground group-hover:text-current" />
               </div>
               <span className="badge-enterprise bg-surface-alt text-muted-foreground">{kpi.trend}</span>
            </div>
            <div className="space-y-0.5 mt-4">
               <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</div>
               <div className="text-[22px] font-bold text-foreground tracking-tight leading-none mt-1">{kpi.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Inventory */}
      <div className="space-y-4">
         <div className="flex items-center justify-between gap-4">
            <div className="relative group max-w-sm flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search Node ID, Cluster, or Region..." 
                 className="input-enterprise pl-9 h-8.5 w-full font-normal" 
               />
            </div>
            <div className="flex items-center gap-2">
               <button className="btn-secondary h-8.5 px-3 flex items-center gap-1.5 text-[12px]">
                  <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse" /> Live Telemetry
               </button>
               <button onClick={() => refetch()} className="btn-secondary h-8.5 w-8.5 p-0 flex items-center justify-center">
                  <RefreshCcw className={cn("h-3.5 w-3.5 text-muted-foreground", isRefetching && "animate-spin")} />
               </button>
            </div>
         </div>

         <div className="table-container">
            <table className="table-enterprise">
               <thead>
                  <tr>
                     <th className="py-3">Infrastructure Identity</th>
                     <th>Classification</th>
                     <th>Cloud Logic</th>
                     <th className="w-48">Health Integrity</th>
                     <th className="w-32">Status</th>
                     <th className="w-12"></th>
                  </tr>
               </thead>
               <tbody>
                  {isLoading ? (
                     Array(5).fill(0).map((_, i) => (
                       <tr key={i}><td colSpan={6} className="py-8"><div className="h-4 skeleton-ui w-full opacity-80 mx-auto rounded" /></td></tr>
                     ))
                  ) : (assets || [])?.map((asset: any) => (
                     <tr key={asset.id} className="group">
                        <td className="py-3.5">
                           <div className="flex items-center gap-3">
                              <div className="h-8.5 w-8.5 bg-surface-alt border border-border rounded-[var(--radius)] flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:border-foreground transition-all">
                                 {asset.type === 'DATABASE' ? <Database className="h-4.5 w-4.5" /> : <Server className="h-4.5 w-4.5" />}
                              </div>
                              <div className="flex flex-col text-left">
                                 <span className="text-[13px] font-semibold text-foreground leading-tight">{asset.name}</span>
                                 <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider font-mono mt-0.5">shard-{asset.id.toString().slice(-4)}</span>
                              </div>
                           </div>
                        </td>
                        <td>
                           <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground bg-surface-alt border border-border px-1.5 py-0.5 rounded italic">
                              {asset.type}
                           </span>
                        </td>
                        <td>
                           <div className="text-[12px] font-semibold text-foreground uppercase tracking-wider text-left">{asset.provider} <span className="opacity-60 mx-1">•</span> <span className="text-muted-foreground font-normal">{asset.region}</span></div>
                        </td>
                        <td>
                           <div className="flex items-center gap-3 pr-6">
                              <div className="h-[5px] flex-grow bg-surface-alt border border-border rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-foreground transition-all duration-1000" 
                                    style={{ width: `${asset.healthScore}%` }} 
                                 />
                              </div>
                              <span className="font-mono text-[11px] font-semibold text-foreground">{asset.healthScore}%</span>
                           </div>
                        </td>
                        <td>
                           <span className={cn(
                             "badge-enterprise py-0.5",
                             asset.status === 'HEALTHY' 
                              ? "badge-success" 
                              : "badge-critical"
                           )}>
                              {asset.status}
                           </span>
                        </td>
                        <td className="text-right">
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
    </div>
  )
}

export default InfrastructurePage
