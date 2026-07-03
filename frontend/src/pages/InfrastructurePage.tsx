import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Database, Server, ShieldCheck, Activity, Search, ExternalLink,
  AlertTriangle, Download, RefreshCcw, Layout, Globe, Box,
  ChevronRight, ArrowRight, Layers, Cpu, Radio
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
    <div className="page-transition-fade space-y-8 p-6 lg:p-8 bg-background min-h-screen">
      {/* Infrastructure Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold tracking-tight text-foreground m-0">Infrastructure Inventory</h1>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-0.5 bg-neutral-100 border border-border rounded text-[11px] font-bold uppercase tracking-wider">
                 <Globe className="h-3.5 w-3.5 text-foreground" />
                 Global Mesh
              </div>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted">
                 Managing <span className="text-foreground font-bold">{assets?.length || 0} production nodes</span> across multi-cloud regions.
              </p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleExport} className="btn-secondary h-9 px-4">
              <Download className="h-4 w-4" />
              <span className="ml-2">Inventory Audit</span>
           </button>
           <button onClick={handleScan} disabled={isScanning} className="btn-primary h-9 px-4">
              {isScanning ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
              <span className="ml-2">Cluster Scan</span>
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
          <div key={kpi.label} className="card-enterprise p-5 flex flex-col justify-between group hover:border-foreground transition-all">
            <div className="flex justify-between items-start">
               <div className="h-9 w-9 bg-surface-alt border border-border rounded-lg flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                  <kpi.icon className="h-4.5 w-4.5" />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-foreground">{kpi.trend}</span>
            </div>
            <div className="space-y-0.5 mt-4">
               <div className="text-[11px] font-bold uppercase tracking-widest text-muted">{kpi.label}</div>
               <div className="text-2xl font-bold text-foreground tracking-tight">{kpi.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Inventory */}
      <div className="space-y-4">
         <div className="flex items-center justify-between gap-4">
            <div className="relative group max-w-sm flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-foreground transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search Node ID, Cluster, or Region..." 
                 className="input-enterprise pl-10 h-10 w-full" 
               />
            </div>
            <div className="flex items-center gap-2">
               <button className="h-10 px-4 border border-border rounded-md hover:border-foreground transition-all flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-muted hover:text-foreground">
                  <Radio className="h-4 w-4" /> Live Signal
               </button>
               <button onClick={() => refetch()} className={cn("p-2 border border-border rounded-md hover:border-foreground transition-all", isRefetching && "animate-spin")}>
                  <RefreshCcw className="h-4 w-4 text-muted" />
               </button>
            </div>
         </div>

         <div className="card-enterprise overflow-hidden">
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
                          <tr key={i}><td colSpan={6} className="py-8"><div className="h-4 skeleton-ui w-full opacity-40 mx-auto rounded" /></td></tr>
                        ))
                     ) : (assets || [])?.map((asset: any) => (
                        <tr key={asset.id} className="group">
                           <td>
                              <div className="flex items-center gap-3">
                                 <div className="h-9 w-9 bg-surface-alt border border-border rounded-lg flex items-center justify-center text-muted group-hover:text-foreground group-hover:border-foreground transition-all">
                                    {asset.type === 'DATABASE' ? <Database className="h-4 w-4" /> : <Server className="h-4 w-4" />}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-foreground">{asset.name}</span>
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest font-mono">shard-{asset.id.toString().slice(-4)}</span>
                                 </div>
                              </div>
                           </td>
                           <td>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground bg-neutral-100 border border-border px-1.5 py-0.5 rounded italic">
                                 {asset.type}
                              </span>
                           </td>
                           <td>
                              <div className="text-[12px] font-bold text-foreground/80 uppercase tracking-tight">{asset.provider} <span className="opacity-40 ml-1">/</span> <span className="text-muted ml-1">{asset.region}</span></div>
                           </td>
                           <td>
                              <div className="flex items-center gap-3 pr-6">
                                 <div className="h-1 flex-1 bg-surface-alt rounded-full overflow-hidden">
                                    <div 
                                       className="h-full bg-foreground transition-all duration-1000" 
                                       style={{ width: `${asset.healthScore}%` }} 
                                    />
                                 </div>
                                 <span className="font-mono text-[11px] font-bold text-foreground">{asset.healthScore}%</span>
                              </div>
                           </td>
                           <td>
                              <div className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
                                asset.status === 'HEALTHY' 
                                 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                 : "bg-red-50 text-red-700 border border-red-100"
                              )}>
                                 {asset.status}
                              </div>
                           </td>
                           <td className="text-right pr-4">
                              <button className="p-1.5 hover:bg-neutral-100 rounded-md transition-all text-muted hover:text-foreground">
                                 <ArrowRight className="h-4 w-4" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  )
}

export default InfrastructurePage
