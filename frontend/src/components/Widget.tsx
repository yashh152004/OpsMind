import React from 'react'
import { cn } from '@/utils/cn'
import { MoreHorizontal, Maximize2, RefreshCw } from 'lucide-react'

interface WidgetProps {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const Widget: React.FC<WidgetProps> = ({ 
  title, 
  icon: Icon, 
  children, 
  className,
  onRefresh,
  isLoading
}) => {
  return (
    <div className={cn("enterprise-card flex flex-col group h-full", className)}>
      <div className="enterprise-card-header h-10 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon className="h-3.5 w-3.5 text-accent shrink-0" />}
          <span className="text-section-title truncate group-hover:text-primary transition-colors">{title}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
             onClick={onRefresh}
             className={cn("p-1 hover:bg-slate-100 rounded-sm text-muted", isLoading && "animate-spin text-accent")}
          >
            <RefreshCw className="h-3 w-3" />
          </button>
          <button className="p-1 hover:bg-slate-100 rounded-sm text-muted">
            <Maximize2 className="h-3 w-3" />
          </button>
          <button className="p-1 hover:bg-slate-100 rounded-sm text-muted">
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export default Widget
