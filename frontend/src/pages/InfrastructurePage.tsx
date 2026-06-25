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
  ExternalLink
} from 'lucide-react'
import { cn } from '@/utils/cn'

const InfrastructurePage: React.FC = () => {
  const { data: assets, isLoading } = useQuery({
    queryKey: ['infra-assets'],
    queryFn: () => apiClient.getInfrastructureAssets()
  })

  return (
    <div className="space-y-6 pb-20 page-transition">
      {/* Infrastructure Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
           <h1 className="text-xl font-black text-slate-900 tracking-tight">Resource Topology</h1>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 Monitoring {assets?.length || 0} distributed infrastructure nodes
              </span>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="btn-secondary h-8 px-3 text-[10px] font-black uppercase tracking-wider">Topology Map</button>
           <button className="btn-primary h-8 px-3 text-[10px] font-black uppercase tracking-wider">Scan Inventory</button>
        </div>
      </div>

      {/* Resource Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Cloud Assets', val: assets?.length || '24', icon: Layers, color: 'text-blue-600' },
          { label: 'Network Uptime', val: '99.982%', icon: Activity, color: 'text-emerald-600' },
          { label: 'Degraded Nodes', val: assets?.filter((a:any) => a.status !== 'HEALTHY').length || '00', icon: Server, color: 'text-orange-500' },
          { label: 'Encryption PKI', val: 'ACTIVE', icon: ShieldCheck, color: 'text-slate-900' },
        ].map(kpi => (
          <div key={kpi.label} className="enterprise-card p-4 flex flex-col justify-between h-28 border-t-2 border-t-slate-100">
            <div className="flex justify-between items-start">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</span>
               <kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} />
            </div>
            <div className="text-2xl font-black metric-mono text-slate-900">{kpi.val}</div>
          </div>
        ))}
      </div>

      {/* Asset Inventory Control */}
      <div className="enterprise-card p-2 flex items-center justify-between bg-white">
         <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter assets by ID, region, or service tag..." 
              className="input-field pl-9 h-8 text-[11px]" 
            />
         </div>
         <div className="flex items-center gap-1 border-l border-slate-100 ml-4 pl-4">
            <button className="btn-ghost p-1.5"><Filter className="h-4 w-4 text-slate-400" /></button>
            <button className="btn-ghost p-1.5"><MoreVertical className="h-4 w-4 text-slate-400" /></button>
         </div>
      </div>

      {/* Inventory Table */}
      <div className="enterprise-card overflow-hidden">
         <table className="enterprise-table">
            <thead>
               <tr>
                  <th>Infrastructure Asset</th>
                  <th>Core Type</th>
                  <th>Regional Cluster / Provider</th>
                  <th className="w-48">Health Index</th>
                  <th className="w-24">State</th>
                  <th className="w-20 text-right">Audit</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="py-4 px-4"><div className="h-8 skeleton" /></td></tr>
                  ))
               ) : assets?.map((asset: any) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                     <td>
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 bg-slate-50 border border-slate-100 rounded flex items-center justify-center text-slate-400">
                              {asset.type === 'DATABASE' ? <Database className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                           </div>
                           <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{asset.name}</span>
                        </div>
                     </td>
                     <td>
                        <span className="text-[9px] font-black text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                           {asset.type}
                        </span>
                     </td>
                     <td>
                        <div className="text-[11px] font-medium text-slate-500">{asset.provider} • {asset.region}</div>
                     </td>
                     <td>
                        <div className="flex items-center gap-3">
                           <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                 className={cn("h-full", asset.healthScore > 90 ? "bg-emerald-500" : "bg-orange-500")} 
                                 style={{ width: `${asset.healthScore}%` }} 
                              />
                           </div>
                           <span className="text-[10px] font-black metric-mono text-slate-500">{asset.healthScore}%</span>
                        </div>
                     </td>
                     <td>
                        <span className={cn(
                          "status-badge",
                          asset.status === 'HEALTHY' ? "badge-success" : "badge-warning"
                        )}>{asset.status === 'HEALTHY' ? 'STABLE' : 'DEGRADED'}</span>
                     </td>
                     <td className="text-right">
                        <button className="btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink className="h-4 w-4" /></button>
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
