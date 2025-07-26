import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import YTMusic, { AlbumDetailed, AlbumFull, ArtistDetailed, ArtistFull, HomeSection, PlaylistDetailed, PlaylistFull, SearchResult, SongDetailed, SongFull, VideoDetailed } from 'ytmusic-api';

@Injectable()
export class YTMusicService {
  private readonly logger = new Logger(YTMusicService.name);
  private readonly maxRetries: number;
  private lastError: Error | null = null;
  private ytMusic: YTMusic;

  constructor(

    private configService: ConfigService,
  ) {
    this.maxRetries = this.configService.get<number>('ytmusic.session.maxRetries') ?? 3;

    this.initializeYtMusic();
  }
  private async initializeYtMusic() {
    try {
      const {default:YtMusic} = await import('ytmusic-api');
      this.ytMusic = new YtMusic();
      await this.ytMusic.initialize();
      this.logger.log('YouTube Music API initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize YouTube Music API:', error);
    }
  }

  async search(query: string): Promise<SearchResult[]> {

    for (let retry = 0; retry < this.maxRetries; retry++) {
      try {        
        const response = await this.ytMusic.search(query);        
        return response
        
      } catch (error) {
        this.lastError = error;
        this.logger.warn(`搜索重试 ${retry + 1}/${this.maxRetries}: ${error.message}`);
        if (retry < this.maxRetries - 1) {
          // 等待一段时间再重试
          await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)));
        }
      }
    }

    throw new HttpException(
      `搜索失败，已重试 ${this.maxRetries} 次: ${this.lastError?.message ?? '未知错误'}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  // 搜索建议
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const suggestions = await this.ytMusic.getSearchSuggestions(query);
      return suggestions;
    } catch (error) {
      this.logger.error('获取搜索建议失败:', error);
      throw new HttpException(
        `获取搜索建议失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 搜索歌曲
  async searchSongs(query: string): Promise<SearchResult[]> {
    try {
      const songs = await this.ytMusic.searchSongs(query);
      return songs;
    } catch (error) {
      this.logger.error('搜索歌曲失败:', error);
      throw new HttpException(
        `搜索歌曲失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 搜索视频
  async searchVideos(query: string): Promise<VideoDetailed[]> {
    try {
      const videos = await this.ytMusic.searchVideos(query);
      return videos;
    } catch (error) {
      this.logger.error('搜索视频失败:', error);
      throw new HttpException(
        `搜索视频失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 搜索艺术家
  async searchArtists(query: string): Promise<ArtistDetailed[]> {
    try {
      const artists = await this.ytMusic.searchArtists(query);
      return artists;
    } catch (error) {
      this.logger.error('搜索艺术家失败:', error);
      throw new HttpException(
        `搜索艺术家失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 搜索专辑
  async searchAlbums(query: string): Promise<AlbumDetailed[]> {
    try {
      const albums = await this.ytMusic.searchAlbums(query);
      return albums;
    } catch (error) {
      this.logger.error('搜索专辑失败:', error);
      throw new HttpException(
        `搜索专辑失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 搜索播放列表
  async searchPlaylists(query: string): Promise<PlaylistDetailed[]> {
    try {
      const playlists = await this.ytMusic.searchPlaylists(query);
      return playlists;
    } catch (error) {
      this.logger.error('搜索播放列表失败:', error);
      throw new HttpException(
        `搜索播放列表失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取歌曲详情
  async getSong(videoId: string): Promise<SongFull> {
    try {
      const song = await this.ytMusic.getSong(videoId);
      return song;
    } catch (error) {
      this.logger.error('获取歌曲详情失败:', error);
      throw new HttpException(
        `获取歌曲详情失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取下一首推荐
  async getUpNexts(videoId: string): Promise<any[]> {
    try {
      const upNexts = await this.ytMusic.getUpNexts(videoId);
      return upNexts;
    } catch (error) {
      this.logger.error('获取下一首推荐失败:', error);
      throw new HttpException(
        `获取下一首推荐失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取歌词
  async getLyrics(videoId: string): Promise<string[] | null> {
    try {
      const lyrics = await this.ytMusic.getLyrics(videoId);
      return lyrics;
    } catch (error) {
      this.logger.error('获取歌词失败:', error);
      throw new HttpException(
        `获取歌词失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取艺术家详情
  async getArtist(artistId: string): Promise<ArtistFull> {
    try {
      const artist = await this.ytMusic.getArtist(artistId);
      return artist;
    } catch (error) {
      this.logger.error('获取艺术家详情失败:', error);
      throw new HttpException(
        `获取艺术家详情失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取艺术家歌曲列表
  async getArtistSongs(artistId: string): Promise<SongDetailed[]> {
    try {
      const songs = await this.ytMusic.getArtistSongs(artistId);
      return songs;
    } catch (error) {
      this.logger.error('获取艺术家歌曲列表失败:', error);
      throw new HttpException(
        `获取艺术家歌曲列表失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取艺术家专辑列表
  async getArtistAlbums(artistId: string): Promise<AlbumDetailed[]> {
    try {
      const albums = await this.ytMusic.getArtistAlbums(artistId);
      return albums;
    } catch (error) {
      this.logger.error('获取艺术家专辑列表失败:', error);
      throw new HttpException(
        `获取艺术家专辑列表失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取专辑详情
  async getAlbum(albumId: string): Promise<AlbumFull> {
    try {
      const album = await this.ytMusic.getAlbum(albumId);
      return album;
    } catch (error) {
      this.logger.error('获取专辑详情失败:', error);
      throw new HttpException(
        `获取专辑详情失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取播放列表详情
  async getPlaylist(playlistId: string): Promise<PlaylistFull> {
    try {
      const playlist = await this.ytMusic.getPlaylist(playlistId);
      return playlist;
    } catch (error) {
      this.logger.error('获取播放列表详情失败:', error);
      throw new HttpException(
        `获取播放列表详情失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取播放列表中的视频
  async getPlaylistVideos(playlistId: string): Promise<VideoDetailed[]> {
    try {
      const videos = await this.ytMusic.getPlaylistVideos(playlistId);
      return videos;
    } catch (error) {
      this.logger.error('获取播放列表视频失败:', error);
      throw new HttpException(
        `获取播放列表视频失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取首页推荐
  async getHomeSections(): Promise<HomeSection[]> {
    try {
      const sections = await this.ytMusic.getHomeSections();
      return sections;
    } catch (error) {
      this.logger.error('获取首页推荐失败:', error);
      throw new HttpException(
        `获取首页推荐失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
}