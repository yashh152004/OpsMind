import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { 
  Cpu, 
  Database, 
  Layers, 
  Server, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  AlertTriangle,
  Download
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

const InfrastructurePage: React.FC = () => {
  const [isScanning, setIsScanning] = React.useState(false)
  const { data: assets, isLoading, refetch } = useQuery({
    queryKey: ['infra-assets'],
    queryFn: () => apiClient.getInfrastructureAssets()
  })

  const handleScan = async () => {
    setIsScanning(true)
    try {
      const result = await apiClient.performInfrastructureScan()
      toast.success(`Scan Complete: ${result.nodes_discovered} nodes analyzed.`)
      refetch()
    } catch (err) {
      toast.error('Automated cluster scan failed.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleTopology = async () => {
     try {
       const data = await apiClient.getInfrastructureTopology()
       console.log("Topology Mapping:", data)
       toast.info('Topology Mapping generated. View console for graph data.', {
         description: `${data.length} upstream/downstream relationships mapped.`
       })
     } catch (err) {
       toast.error('Failed to generate topology view.')
     }
  }

  const handleExport = async () => {
    try {
      const blob = await apiClient.exportModule('infrastructure');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OpsMind_Infrastructure_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Infrastructure inventory exported.');
    } catch (err) {
      toast.error('Failed to generate export file.');
    }
  }

  return (
    <div className="main-content-grid page-transition-fade">
      {/* Infrastructure Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
           <h1 className="text-page-title">Infrastructure Assets</h1>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-helper font-medium">
                 Monitoring {assets?.length || 0} production nodes across multi-cloud clusters
              </span>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleExport} className="btn-secondary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export Inventory
           </button>
           <button onClick={handleTopology} className="btn-secondary h-8 px-3 text-[11px] font-bold uppercase tracking-wider">Topology View</button>
           <button onClick={handleScan} disabled={isScanning} className="btn-primary h-8 px-3 text-[11px] font-bold uppercase tracking-wider disabled:opacity-50">
              {isScanning ? 'Scanning...' : 'Inventory Scan'}
           </button>
        </div>
      </div>

      {/* Resource Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Assets', val: assets?.length || '24', icon: Server, color: 'text-accent' },
          { label: 'Platform Availability', val: '99.99%', icon: Activity, color: 'text-success' },
          { label: 'Unhealthy Nodes', val: assets?.filter((a:any) => a.status !== 'HEALTHY').length || '0', icon: AlertTriangle, color: 'text-critical' },
          { label: 'Cluster Connectivity', val: 'OPTIMAL', icon: ShieldCheck, color: 'text-primary' },
        ].map(kpi => (
          <div key={kpi.label} className="enterprise-card p-4 hover-lift">
            <div className="flex justify-between items-start mb-2">
               <span className="text-metric-label">{kpi.label}</span>
               <kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} />
            </div>
            <div className="text-2xl metric-value">{kpi.val}</div>
          </div>
        ))}
      </div>

      {/* Asset Inventory Control */}
      <div className="enterprise-card p-2 bg-slate-50/50">
         <div className="relative max-w-lg group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Filter assets by ID, cluster, or region..." 
              className="input-field pl-9 h-9" 
            />
         </div>
      </div>

      {/* Inventory Table */}
      <div className="enterprise-table-container">
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th>Resource Identity</th>
                  <th>Component Type</th>
                  <th>Cluster / Region</th>
                  <th className="w-48">Health Metric</th>
                  <th className="w-24">State</th>
                  <th className="w-20 text-right">Actions</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="py-8"><div className="h-4 bg-slate-100 animate-pulse rounded w-full" /></td></tr>
                  ))
               ) : (assets || [])?.map((asset: any) => (
                  <tr key={asset.id} className="group">
                     <td>
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 bg-slate-100 border border-border rounded flex items-center justify-center text-muted">
                              {asset.type === 'DATABASE' ? <Database className="h-4 w-4" /> : <Server className="h-4 w-4" />}
                           </div>
                           <span className="text-[13px] font-bold text-primary">{asset.name}</span>
                        </div>
                     </td>
                     <td>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-secondary border border-border rounded-sm text-[10px] font-bold uppercase tracking-wider">
                           {asset.type}
                        </span>
                     </td>
                     <td>
                        <div className="text-[12px] font-medium text-secondary">{asset.provider} • {asset.region}</div>
                     </td>
                     <td>
                        <div className="flex items-center gap-3">
                           <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                 className={cn("h-full transition-all duration-1000", asset.healthScore > 90 ? "bg-success" : asset.healthScore > 70 ? "bg-warning" : "bg-critical")} 
                                 style={{ width: `${asset.healthScore}%` }} 
                              />
                           </div>
                           <span className="text-[11px] font-bold metric-value text-muted">{asset.healthScore}%</span>
                        </div>
                     </td>
                     <td>
                        <span className={cn(
                          "status-badge",
                          asset.status === 'HEALTHY' ? "badge-success" : "badge-warning"
                        )}>{asset.status === 'HEALTHY' ? 'Healthy' : 'Degraded'}</span>
                     </td>
                     <td className="text-right">
                        <button className="btn-ghost" title="Node Monitoring"><ExternalLink className="h-3.5 w-3.5" /></button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  )
}


export default InfrastructurePage
