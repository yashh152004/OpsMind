import React, { useState } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { 
  Activity, AlertTriangle, ShieldCheck, Cpu,
  Plus, Download, Info, TrendingUp, ChevronRight,
  Search, Globe, Server, Clock, RefreshCw, X, Zap, Terminal
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { searchService, SearchResult } from '@/services/SearchService'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

const DashboardSkeleton = () => (
  <div className="space-y-8 p-6 lg:p-8 animate-fade-in bg-background min-h-screen">
    <div className="flex justify-between items-end pb-8 border-b border-border">
      <div className="space-y-3">
        <div className="h-9 w-60 skeleton-ui animate-pulse" />
        <div className="h-4 w-40 skeleton-ui animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-24 skeleton-ui animate-pulse" />
        <div className="h-9 w-24 skeleton-ui animate-pulse" />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-28 skeleton-ui animate-pulse" />)}
    </div>
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8 h-[360px] skeleton-ui animate-pulse" />
      <div className="lg:col-span-4 h-[360px] skeleton-ui animate-pulse" />
    </div>
  </div>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border-strong p-3 rounded-[var(--radius)] shadow-lg text-left">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-foreground" />
          <span className="text-[13px] font-semibold text-foreground">
             Latency: {payload[0].value}ms
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [isExporting, setIsExporting] = useState(false)
  const [showWidgetMarketplace, setShowWidgetMarketplace] = useState(false)
  
  // Command Palette State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const paletteRef = React.useRef<HTMLDivElement>(null)

  const { data: stats, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
    refetchInterval: 15000 
  })

  React.useEffect(() => {
    const search = async () => {
      if (searchQuery.length > 0) {
        setIsSearching(true)
        const data = await searchService.search(searchQuery)
        setSearchResults(data)
        setIsSearching(false)
      } else {
        setSearchResults([])
      }
    }
    const timer = setTimeout(search, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setShowPalette(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isLoading) return <DashboardSkeleton />

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await apiClient.exportModule('incidents')
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `OpsMind_Status_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      toast.success("Platform state exported successfully.")
    } catch (e) {
      toast.error("Failed to generate export.")
    } finally {
      setIsExporting(false)
    }
  }

  const kpis = [
    { label: 'Platform Availability', val: stats?.uptime || '99.99%', trend: '+0.01%', status: 'NOMINAL', icon: Globe, href: '/infrastructure' },
    { label: 'Active Incidents', val: stats?.activeIncidents || '0', trend: 'STABLE', status: stats?.activeIncidents > 0 ? 'WARNING' : 'HEALTHY', icon: AlertTriangle, href: '/incidents' },
    { label: 'Median Latency', val: stats?.mttr || '18ms', trend: '-1.4ms', status: 'FAST', icon: Cpu, href: '/analytics' },
    { label: 'Security Posture', val: '98.4%', trend: 'SECURE', status: 'VERIFIED', icon: ShieldCheck, href: '/security' },
  ]

  return (
    <div className="page-transition-fade space-y-6 p-6 lg:p-8 bg-background min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 pb-6 border-b border-border">
        <div className="space-y-1">
           <h1 className="text-[32px] font-bold tracking-tight text-foreground m-0 leading-tight">Platform Overview</h1>
           <div className="flex items-center gap-2.5">
              <span className="badge-enterprise badge-success flex items-center gap-1.5 py-0.5">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Operational
              </span>
              <span className="text-border">|</span>
              <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-1">
                 <Clock className="h-3.5 w-3.5" /> Last Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
           </div>
        </div>

        {/* Unified Command Palette Bar */}
        <div className="flex-1 max-w-xl relative" ref={paletteRef}>
           <div className="relative group">
              <Search className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors", isSearching ? "text-foreground animate-pulse" : "text-muted-foreground group-focus-within:text-foreground")} />
              <input 
                type="text" 
                placeholder="Type '/rca' or 'incidents' to run analysis..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowPalette(true); }}
                onFocus={() => setShowPalette(true)}
                className="w-full h-10 bg-surface-alt border border-border rounded-[var(--radius)] pl-10 pr-24 text-[14px] font-normal text-foreground placeholder:text-muted-foreground/75 outline-none transition-all duration-150 focus:border-border-strong focus:ring-1 focus:ring-foreground/5 shadow-xs"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 select-none pointer-events-none">
                 <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[9px] font-medium text-muted uppercase">CTRL</kbd>
                 <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[9px] font-medium text-muted uppercase">/</kbd>
              </div>
           </div>

           {showPalette && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border-strong rounded-[var(--radius)] shadow-[0_12px_30px_rgba(0,0,0,0.12)] z-[400] overflow-hidden animate-fade-in">
                 <div className="p-1.5 space-y-0.5 max-h-[350px] overflow-y-auto">
                    {searchResults.map((res) => (
                       <button 
                         key={res.id}
                         onClick={() => navigate(res.href)}
                         className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-surface-hover rounded-[var(--radius)] transition-colors text-left text-foreground"
                       >
                          <div className="flex items-center gap-3">
                             <div className="h-7 w-7 bg-surface-alt border border-border rounded flex items-center justify-center text-muted-foreground">
                                {res.type === 'INCIDENT' ? <AlertTriangle className="h-3.5 w-3.5" /> : 
                                 res.type === 'SECURITY' ? <ShieldCheck className="h-3.5 w-3.5" /> : 
                                 <Activity className="h-3.5 w-3.5" />}
                             </div>
                             <div>
                                <div className="text-[13px] font-medium leading-tight">{res.title}</div>
                                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">{res.subtitle}</div>
                             </div>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                       </button>
                    ))}
                 </div>
                 <div className="p-2.5 bg-surface-alt/70 border-t border-border flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{searchResults.length} Local matches</span>
                    <div className="flex items-center gap-2.5">
                       <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground">
                          <kbd className="px-1 py-0.5 bg-surface border border-border rounded">ENTER</kbd> navigate
                       </div>
                       <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground">
                          <kbd className="px-1 py-0.5 bg-surface border border-border rounded">ESC</kbd> close
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={() => refetch()}
             className="btn-secondary h-8.5 w-8.5 p-0 flex items-center justify-center"
             title="Force Refresh"
           >
              <RefreshCw className={cn("h-3.5 w-3.5", isRefetching && "animate-spin")} />
           </button>
           <button 
             onClick={handleExport}
             disabled={isExporting}
             className="btn-secondary h-8.5 px-3"
           >
              {isExporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="ml-1.5">Export State</span>
           </button>
           <button 
              onClick={() => setShowWidgetMarketplace(true)}
              className="btn-primary h-8.5 px-3"
           >
              <Plus className="h-4 w-4" />
              <span className="ml-1.5">Extend HUD</span>
           </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ icon: Icon, ...kpi }) => (
          <div key={kpi.label} 
               onClick={() => navigate(kpi.href)}
               className="card-enterprise p-5 cursor-pointer flex flex-col justify-between group active:scale-[0.99] transition-all">
            <div className="flex justify-between items-start">
               <div className="p-1.5 bg-surface-alt border border-border rounded-md text-muted-foreground transition-all group-hover:bg-foreground group-hover:text-background group-hover:border-foreground">
                  <Icon className="h-4 w-4" />
               </div>
               <span className={cn(
                 "badge-enterprise",
                 kpi.status === 'HEALTHY' || kpi.status === 'NOMINAL' ? "badge-success" : 
                 kpi.status === 'FAST' || kpi.status === 'VERIFIED' ? "badge-info" : "badge-warning"
               )}>{kpi.status}</span>
            </div>
             <div className="mt-4 space-y-1">
               <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</div>
               <div className="flex items-end justify-between">
                  <div className="text-[22px] font-bold tracking-tight text-foreground">{kpi.val}</div>
                  <div className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                     <TrendingUp className="h-3 w-3" />
                     {kpi.trend}
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Telemetry Chart */}
        <div className="lg:col-span-8 flex flex-col h-full">
           <div className="card-enterprise flex-1 flex flex-col">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                 <div>
                    <h3 className="text-[14px] font-bold text-foreground">Cluster Performance</h3>
                    <p className="text-[11px] text-muted-foreground font-normal tracking-wide mt-0.5">Throughput vs Latency • 6h window</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-foreground" />
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Ingress Flow</span>
                 </div>
              </div>
              <div className="p-4 h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={stats?.performanceSeries || []}>
                     <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="currentColor" className="text-foreground" stopOpacity={0.06}/>
                          <stop offset="95%" stopColor="currentColor" className="text-foreground" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
                     <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: 'currentColor', fontSize: 10, fontWeight: 500}} 
                        className="text-muted-foreground"
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: 'currentColor', fontSize: 10, fontWeight: 500}}
                        className="text-muted-foreground"
                     />
                     <Tooltip content={<CustomTooltip />} />
                     <Area type="monotone" dataKey="value" stroke="currentColor" strokeWidth={1.5} fillOpacity={1} fill="url(#colorValue)" className="text-foreground" />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Tactical Feed */}
        <div className="lg:col-span-4 space-y-6">
           <div className="card-enterprise p-5">
              <h3 className="text-[13px] font-bold text-foreground mb-4 uppercase tracking-wider">Incident distribution</h3>
              <div className="space-y-2">
                 {(stats?.severityDistribution || []).map((entry: any) => (
                    <div key={entry.name} 
                         onClick={() => navigate('/incidents')}
                         className="flex items-center justify-between p-2.5 rounded-md border border-border hover:border-border-strong hover:bg-surface-alt transition-all cursor-pointer group">
                       <div className="flex items-center gap-2.5">
                          <div className={cn("h-1.5 w-1.5 rounded-full", 
                             entry.name === 'P0' || entry.name === 'P1' ? "bg-red-500 animate-pulse" : 
                             entry.name === 'P2' ? "bg-amber-500" : "bg-neutral-500")} 
                          />
                          <span className="text-[13px] font-medium text-foreground">{entry.name} Severity</span>
                       </div>
                       <span className="text-[13px] font-semibold text-foreground">{entry.count}</span>
                    </div>
                 ))}
                 {(!stats?.severityDistribution || stats.severityDistribution.length === 0) && (
                    <div className="text-center py-6">
                       <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-20" />
                       <p className="text-[12px] font-medium text-muted">No active priorities</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="card-enterprise p-5 bg-foreground text-background border-none shadow-md">
              <div className="flex items-center gap-2 mb-3">
                 <Zap className="h-4 w-4 text-emerald-400" />
                 <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Intelligent Insights</span>
              </div>
              <p className="text-[13px] font-medium leading-relaxed mb-5 text-neutral-400">
                 Platform is stable. AI monitored {stats?.riskProfiles?.length || 0} potential anomalies in the last window. All resolved through automated shielding.
              </p>
              <button 
                onClick={() => navigate('/ai-insights')}
                className="w-full h-8.5 bg-background text-foreground rounded font-semibold text-[11px] uppercase tracking-wider hover:bg-opacity-90 transition-colors shadow-xs"
              >
                 View Analysis Matrix
              </button>
           </div>
        </div>
      </div>

      {/* Intelligence & Audit Feed */}
      <div className="space-y-3">
         <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
               <h2 className="text-[16px] font-semibold tracking-tight text-foreground m-0">Recent Operational Intelligence</h2>
               <div className="px-1.5 py-0.5 bg-surface-alt border border-border rounded text-[9px] font-bold text-muted-foreground uppercase">Live Stream</div>
            </div>
            <button onClick={() => navigate('/ai-insights')} className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
               Detailed Grid <ChevronRight className="h-4.5 w-4.5" />
            </button>
         </div>
         
         <div className="table-container">
            <table className="table-enterprise">
               <thead>
                  <tr>
                     <th className="w-[180px]">Signal Type</th>
                     <th>Intelligence Reasoning & Live Context</th>
                     <th className="text-right w-[110px]">Confidence</th>
                     <th className="w-24 text-right">Verification</th>
                  </tr>
               </thead>
               <tbody>
                  {(stats?.riskProfiles || []).slice(0, 5).map((item: any, idx: number) => (
                     <tr key={idx}>
                        <td>
                           <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-surface-alt rounded">
                                 <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <span className="font-semibold text-[12px] tracking-tight">{item.type}</span>
                           </div>
                        </td>
                        <td className="text-[13px] text-foreground/80 py-3.5">
                           {item.context}
                        </td>
                        <td className="text-right font-mono font-medium text-[13px] text-foreground/90">
                           {(item.conf * 100).toFixed(1)}%
                        </td>
                        <td className="text-right">
                           <button 
                             onClick={() => navigate('/ai-chat')}
                             className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                           >
                              Review
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
      
      {/* Widget Provisioning Modal */}
      {showWidgetMarketplace && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
           <div className="card-enterprise w-full max-w-xl bg-surface shadow-xl animate-in zoom-in-95 duration-200">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                 <div className="space-y-0.5 text-left">
                    <h2 className="text-[16px] font-semibold text-foreground m-0">Provision New Module</h2>
                    <p className="text-[12px] text-muted-foreground font-normal mb-0">Extend the Platform Command interface with telemetry views.</p>
                 </div>
                 <button onClick={() => setShowWidgetMarketplace(false)} className="p-1.5 hover:bg-surface-hover rounded-full transition-colors">
                    <X className="h-5 w-5" />
                 </button>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-3.5">
                 {[
                   { name: 'Node Topology', icon: Terminal, desc: 'Visual service mapping' },
                   { name: 'Correlation', icon: Activity, desc: 'Multi-signal analysis' },
                   { name: 'Cloud Spend', icon: Globe, desc: 'Real-time billing' },
                   { name: 'Posture', icon: ShieldCheck, desc: 'Compliance status' },
                   { name: 'Latency', icon: Server, desc: 'Region RTT metrics' },
                   { name: 'Prophet AI', icon: Zap, desc: 'Predictive analytics' }
                 ].map(({ icon: Icon, ...w }) => (
                    <div key={w.name} className="p-3.5 border border-border rounded-[var(--radius)] hover:border-border-strong hover:bg-surface-alt cursor-pointer group transition-all text-center">
                       <div className="h-9 w-9 bg-surface-alt border border-border rounded-md mx-auto mb-2.5 flex items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-background group-hover:border-foreground">
                          <Icon className="h-4.5 w-4.5" />
                       </div>
                       <div className="text-[13px] font-semibold text-foreground mb-0.5">{w.name}</div>
                       <div className="text-[11px] text-muted-foreground leading-snug">{w.desc}</div>
                    </div>
                 ))}
              </div>
              <div className="px-5 py-3 bg-surface-alt border-t border-border flex justify-end gap-2.5">
                 <button onClick={() => setShowWidgetMarketplace(false)} className="btn-ghost">Cancel</button>
                 <button onClick={() => setShowWidgetMarketplace(false)} className="btn-primary h-8.5">Provision</button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
