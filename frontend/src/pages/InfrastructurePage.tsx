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
    <div className="space-y-8 pb-20 page-transition">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit">Resource Topology</h1>
          <p className="text-muted-foreground text-sm font-medium">Monitoring distributed infrastructure assets and service health.</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="btn-secondary h-9 text-xs">Map View</button>
           <button className="btn-primary h-9 text-xs">Inventory Scan</button>
        </div>
      </div>

      {/* Resource KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
         {[
           { label: 'Cloud Resources', val: assets?.length || 0, icon: Layers, color: 'text-blue-500' },
           { label: 'Uptime (Global)', val: '99.98%', icon: Activity, color: 'text-emerald-500' },
           { label: 'Degraded Nodes', val: assets?.filter((a:any) => a.status !== 'HEALTHY').length || 0, icon: Server, color: 'text-orange-500' },
           { label: 'Kms Encryption', val: 'ENABLED', icon: ShieldCheck, color: 'text-purple-500' },
         ].map(stat => (
           <div key={stat.label} className="enterprise-card p-5">
              <div className="flex items-center justify-between mb-3">
                 <div className={cn("p-1.5 rounded-md bg-accent/40 border border-border", stat.color)}>
                    <stat.icon className="h-4 w-4" />
                 </div>
                 <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
              <div className="text-xl font-bold mt-1 font-mono">{stat.val}</div>
           </div>
         ))}
      </div>

      {/* Asset Table */}
      <div className="enterprise-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-accent/10">
           <div className="relative max-w-sm w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input type="text" className="input-field pl-10 h-9" placeholder="Filter by asset ID or tag..." />
           </div>
           <div className="flex items-center gap-2">
              <button className="btn-ghost p-2"><Filter className="h-4 w-4" /></button>
              <button className="btn-ghost p-2"><MoreVertical className="h-4 w-4" /></button>
           </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-accent/40 border-b border-border">
            <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <th className="px-6 py-4">Asset Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Provider / Region</th>
              <th className="px-6 py-4">Health Index</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
               Array(4).fill(0).map((_, i) => <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-10 skeleton" /></td></tr>)
            ) : assets?.map((asset: any) => (
              <tr key={asset.id} className="hover:bg-accent/10 transition-colors">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-accent flex items-center justify-center rounded">
                         {asset.type === 'DATABASE' ? <Database className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                      </div>
                      <span className="text-sm font-bold">{asset.name}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-accent px-1.5 py-0.5 rounded border border-border">
                     {asset.type}
                   </span>
                </td>
                <td className="px-6 py-4">
                   <div className="text-xs font-medium">{asset.provider} / {asset.region}</div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-accent rounded-full overflow-hidden">
                         <div 
                           className={cn("h-full", asset.healthScore > 90 ? "bg-emerald-500" : "bg-orange-500")} 
                           style={{ width: `${asset.healthScore}%` }} 
                         />
                      </div>
                      <span className="text-[10px] font-bold font-mono">{asset.healthScore}%</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className={cn(
                     "status-badge",
                     asset.status === 'HEALTHY' ? "badge-success" : "badge-warning"
                   )}>{asset.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="btn-ghost p-1.5"><ExternalLink className="h-4 w-4" /></button>
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
