import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Database, Server, ShieldCheck, Activity, Search, ExternalLink,
  AlertTriangle, Download, RefreshCcw, Layout, Globe, Box
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
      toast.success(`CLUSTER_SCAN_COMPLETE: ${result.nodes_discovered} active nodes identified.`)
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
    <div className="page-transition-fade space-y-10 p-10 bg-white min-h-screen">
      {/* Infrastructure Orchestration Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tighter text-black m-0 font-geist">Infrastructure</h1>
           <div className="flex items-center gap-4">
              <p className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                 <Globe className="h-4 w-4 text-black" /> Multi-Cloud Mesh Topology • 14 Active Nodes
              </p>
              <div className="h-4 w-[1px] bg-border" />
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">State: Synchronized</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleExport} className="btn-secondary h-10 border-strong">
              <Download className="h-4 w-4" />
              <span className="ml-2">Export Inventory</span>
           </button>
           <button onClick={handleScan} disabled={isScanning} className="btn-primary h-10 shadow-xl shadow-black/10">
              {isScanning ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Box className="h-4 w-4" />}
              <span className="ml-2">Deploy Scan Logic</span>
           </button>
        </div>
      </div>

      {/* Strategic Resource Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Managed Assets', val: assets?.length || '14', icon: Server, status: 'NOMINAL' },
          { label: 'Latency (Avg)', val: '1.4ms', icon: Activity, status: 'FAST' },
          { label: 'Unhealthy Segments', val: assets?.filter((a:any) => a.status !== 'HEALTHY').length || '0', icon: AlertTriangle, status: 'STABLE' },
          { label: 'Mesh Integrity', val: '99.9%', icon: ShieldCheck, status: 'SECURE' },
        ].map(kpi => (
          <div key={kpi.label} className="enterprise-card p-6 border-strong/40 group hover:border-black transition-all">
            <div className="flex justify-between items-start mb-6">
               <div className="h-10 w-10 bg-black text-white rounded flex items-center justify-center shadow-lg">
                  <kpi.icon className="h-5 w-5" />
               </div>
               <span className="status-badge badge-info">{kpi.status}</span>
            </div>
            <div className="space-y-1">
               <div className="text-[11px] font-black uppercase tracking-widest text-muted">{kpi.label}</div>
               <div className="text-3xl font-black text-black tracking-tighter">{kpi.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Control Matrix */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div className="relative group flex-1 max-w-sm">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted group-focus-within:text-black transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search Node, Cluster, or Region Detail..." 
                 className="input-field pl-10 h-10 border-strong" 
               />
            </div>
            <button onClick={() => refetch()} className={cn("p-2 border border-border-strong rounded hover:border-black transition-all", isRefetching && "animate-spin")}>
               <RefreshCcw className="h-4 w-4 text-muted" />
            </button>
         </div>

         <div className="enterprise-table-container shadow-2xl shadow-black/5">
            <table className="enterprise-table">
               <thead>
                  <tr>
                     <th>Entity Identity</th>
                     <th>Core Class</th>
                     <th>Logical Region</th>
                     <th className="w-48">Integrity Score</th>
                     <th className="w-24">Lifecycle</th>
                     <th className="w-16"></th>
                  </tr>
               </thead>
               <tbody>
                  {isLoading ? (
                     Array(6).fill(0).map((_, i) => (
                       <tr key={i}><td colSpan={6} className="py-10"><div className="h-6 skeleton w-full" /></td></tr>
                     ))
                  ) : (assets || [])?.map((asset: any) => (
                     <tr key={asset.id} className="group hover:bg-surface-alt/50 transition-all border-l-2 border-transparent hover:border-black">
                        <td>
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-surface-alt border border-border-strong rounded flex items-center justify-center text-muted group-hover:text-black group-hover:border-black transition-all">
                                 {asset.type === 'DATABASE' ? <Database className="h-4.5 w-4.5" /> : <Server className="h-4.5 w-4.5" />}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[13px] font-black text-black">{asset.name}</span>
                                 <span className="text-[9px] font-bold text-muted uppercase tracking-widest italic">Node-ID: {asset.id.toString().slice(-6)}</span>
                              </div>
                           </div>
                        </td>
                        <td>
                           <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-sm italic">
                              {asset.type}
                           </span>
                        </td>
                        <td>
                           <div className="text-[12px] font-bold text-black uppercase tracking-widest mt-1">{asset.provider} • <span className="text-muted">{asset.region}</span></div>
                        </td>
                        <td>
                           <div className="flex items-center gap-3 pr-4">
                              <div className="h-1.5 flex-1 bg-surface-alt border border-border-strong rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-black transition-all duration-1000" 
                                    style={{ width: `${asset.healthScore}%` }} 
                                 />
                              </div>
                              <span className="font-mono text-[11px] font-black text-black">{asset.healthScore}%</span>
                           </div>
                        </td>
                        <td>
                           <span className={cn(
                             "status-badge",
                             asset.status === 'HEALTHY' ? "badge-success" : "badge-warning"
                           )}>{asset.status}</span>
                        </td>
                        <td className="text-right pr-4">
                           <button className="p-2 hover:bg-black hover:text-white rounded transition-all border border-transparent hover:border-black"><ExternalLink className="h-3.5 w-3.5" /></button>
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
