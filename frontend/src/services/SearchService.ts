import { apiClient } from './api';

export type SearchResourceType = 
  | 'INCIDENT' 
  | 'ALERT' 
  | 'INFRASTRUCTURE' 
  | 'SERVICE' 
  | 'CLUSTER' 
  | 'LOG' 
  | 'ANALYTICS' 
  | 'PREDICTION' 
  | 'SECURITY' 
  | 'SETTING' 
  | 'INTEGRATION' 
  | 'AI_CHAT' 
  | 'NOTIFICATION' 
  | 'USER';

export interface SearchResult {
  id: string;
  type: SearchResourceType;
  title: string;
  subtitle: string;
  href: string;
  metadata?: any;
  rank?: number;
}

class SearchService {
  private static instance: SearchService;
  private localIndex: SearchResult[] = [];
  private staticCommands: SearchResult[] = [
    { id: 'cmd-incidents', type: 'INCIDENT', title: 'View All Incidents', subtitle: 'Global incident management hub', href: '/incidents' },
    { id: 'cmd-alerts', type: 'ALERT', title: 'Alert Stream', subtitle: 'Real-time signal monitoring', href: '/alerts' },
    { id: 'cmd-infra', type: 'INFRASTRUCTURE', title: 'Infrastructure Inventory', subtitle: 'Clusters, nodes and assets', href: '/infrastructure' },
    { id: 'cmd-security', type: 'SECURITY', title: 'Security Posture', subtitle: 'Vulnerability scans and risks', href: '/security' },
    { id: 'cmd-analytics', type: 'ANALYTICS', title: 'Telemetry Analytics', subtitle: 'Deep dive into performance data', href: '/analytics' },
    { id: 'cmd-ai', type: 'AI_CHAT', title: 'AI Copilot', subtitle: 'Autonomous reasoning interface', href: '/ai-chat' },
    { id: 'cmd-settings', type: 'SETTING', title: 'Platform Settings', subtitle: 'Identity and workspace config', href: '/settings' },
  ];

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Register local data into the searchable index.
   * Useful for indexing current page contents.
   */
  public registerLocalData(items: SearchResult[]) {
    // Basic deduplication
    const newItems = items.filter(item => !this.localIndex.find(idx => idx.id === item.id));
    this.localIndex = [...this.localIndex, ...newItems].slice(-1000); // Keep last 1000 items
  }

  /**
   * Performs a global search across local index, static commands, and backend API.
   */
  public async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const normalizedQuery = query.toLowerCase().trim();
    
    // 1. Search Static Commands
    const commandMatches = this.staticCommands.filter(cmd => 
      cmd.title.toLowerCase().includes(normalizedQuery) || 
      cmd.subtitle.toLowerCase().includes(normalizedQuery)
    );

    // 2. Search Local Index
    const localMatches = this.localIndex.filter(item => 
      item.title.toLowerCase().includes(normalizedQuery) || 
      item.subtitle.toLowerCase().includes(normalizedQuery)
    );

    // 3. Search Backend (Unified Search)
    let remoteMatches: SearchResult[] = [];
    try {
      const data = await apiClient.globalSearch(query);
      remoteMatches = data.map((item: any) => ({
        id: item.id || `remote-${Math.random()}`,
        type: item.type as SearchResourceType,
        title: item.title,
        subtitle: item.subtitle,
        href: this.resolveHref(item.type, item.id)
      }));
    } catch (e) {
      console.error('Remote search failed', e);
    }

    // Combine and Rank
    const combined = [...commandMatches, ...localMatches, ...remoteMatches];
    
    // Simple Deduplication by ID
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

    return unique.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      // Exact match gets top priority
      if (aTitle === normalizedQuery) return -1;
      if (bTitle === normalizedQuery) return 1;

      // Starts with gets second priority
      if (aTitle.startsWith(normalizedQuery) && !bTitle.startsWith(normalizedQuery)) return -1;
      if (bTitle.startsWith(normalizedQuery) && !aTitle.startsWith(normalizedQuery)) return 1;

      return 0;
    }).slice(0, 50); // Cap results
  }

  private resolveHref(type: string, _id: string): string {
    switch (type) {
      case 'INCIDENT': return '/incidents';
      case 'ALERT': return '/alerts';
      case 'INFRASTRUCTURE': return '/infrastructure';
      case 'SECURITY': return '/security';
      case 'AI_CHAT': return '/ai-chat';
      case 'USER': return '/settings';
      default: return '/dashboard';
    }
  }
}

export const searchService = SearchService.getInstance();
