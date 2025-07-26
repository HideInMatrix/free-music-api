import { Controller, Get, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { YTMusicService } from './ytmusic.service';
import { VOUtils } from '@/utils/voUtils';

@ApiTags('YouTube Music')
@Controller('ytmusic')
export class YTMusicController {
  constructor(
    private ytMusicService: YTMusicService,
  ) {}

  @Get('search')
  @ApiOperation({ summary: '搜索音乐' })
  @ApiQuery({ name: 'q', description: '搜索关键词', required: true })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async search(
    @Query('q') query: string,
  ): Promise<VOUtils> {
    if (!query) {
      throw new HttpException('搜索关键词不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.search(query);
    
    return VOUtils.success(result);
  }

  @Get('suggestions')
  @ApiOperation({ summary: '获取搜索建议' })
  @ApiQuery({ name: 'q', description: '搜索关键词', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSearchSuggestions(@Query('q') query: string): Promise<VOUtils> {
    if (!query) {
      throw new HttpException('搜索关键词不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.getSearchSuggestions(query);
    return VOUtils.success(result);
  }

  @Get('songs')
  @ApiOperation({ summary: '搜索歌曲' })
  @ApiQuery({ name: 'q', description: '搜索关键词', required: true })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchSongs(@Query('q') query: string): Promise<VOUtils> {
    if (!query) {
      throw new HttpException('搜索关键词不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.searchSongs(query);
    return VOUtils.success(result);
  }

  @Get('videos')
  @ApiOperation({ summary: '搜索视频' })
  @ApiQuery({ name: 'q', description: '搜索关键词', required: true })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchVideos(@Query('q') query: string): Promise<VOUtils> {
    if (!query) {
      throw new HttpException('搜索关键词不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.searchVideos(query);
    return VOUtils.success(result);
  }

  @Get('artists')
  @ApiOperation({ summary: '搜索艺术家' })
  @ApiQuery({ name: 'q', description: '搜索关键词', required: true })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchArtists(@Query('q') query: string): Promise<VOUtils> {
    if (!query) {
      throw new HttpException('搜索关键词不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.searchArtists(query);
    return VOUtils.success(result);
  }

  @Get('albums')
  @ApiOperation({ summary: '搜索专辑' })
  @ApiQuery({ name: 'q', description: '搜索关键词', required: true })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchAlbums(@Query('q') query: string): Promise<VOUtils> {
    if (!query) {
      throw new HttpException('搜索关键词不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.searchAlbums(query);
    return VOUtils.success(result);
  }

  @Get('playlists')
  @ApiOperation({ summary: '搜索播放列表' })
  @ApiQuery({ name: 'q', description: '搜索关键词', required: true })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchPlaylists(@Query('q') query: string): Promise<VOUtils> {
    if (!query) {
      throw new HttpException('搜索关键词不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.searchPlaylists(query);
    return VOUtils.success(result);
  }

  @Get('song/:id')
  @ApiOperation({ summary: '获取歌曲详情' })
  @ApiParam({ name: 'id', description: '歌曲ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSong(@Param('id') id: string): Promise<VOUtils> {
    if (!id) {
      throw new HttpException('歌曲ID不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.getSong(id);
    return VOUtils.success(result);
  }

  @Get('song/:id/upnexts')
  @ApiOperation({ summary: '获取下一首推荐' })
  @ApiParam({ name: 'id', description: '歌曲ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUpNexts(@Param('id') id: string): Promise<VOUtils> {
    if (!id) {
      throw new HttpException('歌曲ID不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.getUpNexts(id);
    return VOUtils.success(result);
  }

  @Get('song/:id/lyrics')
  @ApiOperation({ summary: '获取歌词' })
  @ApiParam({ name: 'id', description: '歌曲ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getLyrics(@Param('id') id: string): Promise<VOUtils> {
    if (!id) {
      throw new HttpException('歌曲ID不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.getLyrics(id);
    return VOUtils.success(result);
  }

  @Get('artist/:id')
  @ApiOperation({ summary: '获取艺术家详情' })
  @ApiParam({ name: 'id', description: '艺术家ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getArtist(@Param('id') id: string): Promise<VOUtils> {
    if (!id) {
      throw new HttpException('艺术家ID不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.getArtist(id);
    return VOUtils.success(result);
  }

  @Get('artist/:id/songs')
  @ApiOperation({ summary: '获取艺术家歌曲列表' })
  @ApiParam({ name: 'id', description: '艺术家ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getArtistSongs(@Param('id') id: string): Promise<VOUtils> {
    if (!id) {
      throw new HttpException('艺术家ID不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.getArtistSongs(id);
    return VOUtils.success(result);
  }

  @Get('artist/:id/albums')
  @ApiOperation({ summary: '获取艺术家专辑列表' })
  @ApiParam({ name: 'id', description: '艺术家ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getArtistAlbums(@Param('id') id: string): Promise<VOUtils> {
    if (!id) {
      throw new HttpException('艺术家ID不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.getArtistAlbums(id);
    return VOUtils.success(result);
  }

  @Get('album/:id')
  @ApiOperation({ summary: '获取专辑详情' })
  @ApiParam({ name: 'id', description: '专辑ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAlbum(@Param('id') id: string): Promise<VOUtils> {
    if (!id) {
      throw new HttpException('专辑ID不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.getAlbum(id);
    return VOUtils.success(result);
  }

  @Get('playlist/:id')
  @ApiOperation({ summary: '获取播放列表详情' })
  @ApiParam({ name: 'id', description: '播放列表ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPlaylist(@Param('id') id: string): Promise<VOUtils> {
    if (!id) {
      throw new HttpException('播放列表ID不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.getPlaylist(id);
    return VOUtils.success(result);
  }

  @Get('playlist/:id/videos')
  @ApiOperation({ summary: '获取播放列表视频' })
  @ApiParam({ name: 'id', description: '播放列表ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPlaylistVideos(@Param('id') id: string): Promise<VOUtils> {
    if (!id) {
      throw new HttpException('播放列表ID不能为空', HttpStatus.BAD_REQUEST);
    }
    const result = await this.ytMusicService.getPlaylistVideos(id);
    return VOUtils.success(result);
  }

  @Get('home')
  @ApiOperation({ summary: '获取首页推荐' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHomeSections(): Promise<VOUtils> {
    const result = await this.ytMusicService.getHomeSections();
    return VOUtils.success(result);
  }
}