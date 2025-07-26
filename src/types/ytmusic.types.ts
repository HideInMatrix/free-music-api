export interface YTMusicSession {
    cookies: string;
    userAgent: string;
    visitorId: string;
    sessionToken: string;
    context: any;
    createdAt: Date;
    expiresAt: Date;
  }
  
  export interface SearchOptions {
    filter?: 'songs' | 'videos' | 'albums' | 'playlists' | 'artists';
    limit?: number;
  }
  
  export interface SearchResult {
    title: string;
    artist: string;
    videoId: string;
    duration?: string;
    thumbnails?: any[];
    album?: string;
    playUrl?: string;
  }
  
  export interface BrowserConfig {
    headless?: boolean;
    userDataDir?: string;
    proxy?: string;
    timeout?: number;
  }
  