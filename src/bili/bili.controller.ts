import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { BiliService } from './bili.service';

@ApiTags('Bilibili')
@Controller('bili')
export class BiliController {
    constructor(private readonly biliService: BiliService) { }

    @Get('search')
    @ApiOperation({ summary: '搜索' })
    @ApiQuery({ name: 'keyword', description: '搜索关键词', required: true })
    @ApiQuery({ name: 'page', description: '页码', required: true })
    @ApiQuery({ name: 'type', description: '搜索类型(music/album/artist)', required: true })
    async search(
        @Query('keyword') keyword: string,
        @Query('page') page: number,
        @Query('type') type: string,
    ) {
        if (type === 'album' || type === 'music') {
            return await this.biliService.searchAlbum(keyword, page);
        }
        if (type === 'artist') {
            return await this.biliService.searchArtist(keyword, page);
        }
    }

    @Get('media/source')
    @ApiOperation({ summary: '获取媒体源' })
    @ApiQuery({ name: 'aid', description: '音频id', required: true })
    @ApiQuery({ name: "bvid", description: "B站视频ID", required: true })
    @ApiQuery({ name: 'cid', description: '音频CID', required: false })
    @ApiQuery({ name: 'quality', description: '音质(low/standard/high/super)', required: true })
    async getMediaSource(
        @Query('bvid') bvid: string,
        @Query('aid') aid: string,
        @Query('cid') cid: string,
        @Query('quality') quality: string,
    ) {
        const musicItem = { bvid, aid, cid }; // 根据ID获取音乐信息
        return await this.biliService.getMediaSource(musicItem, quality);
    }

    @Get('album/info')
    @ApiOperation({ summary: '获取专辑信息' })
    @ApiQuery({ name: 'aid', description: '音频id', required: true })
    @ApiQuery({ name: "bvid", description: "B站视频ID", required: true })
    async getAlbumInfo(
        @Query('bvid') bvid: string,
        @Query('aid') aid: string,
    ) {
        const albumItem = { bvid, aid }; // 根据ID获取专辑信息
        return await this.biliService.getAlbumInfo(albumItem);
    }

    @Get('artist/:id/works')
    @ApiOperation({ summary: '获取艺术家作品' })
    @ApiParam({ name: 'id', description: '艺术家ID' })
    @ApiQuery({ name: 'page', description: '页码', required: true })
    @ApiQuery({ name: 'type', description: '作品类型{video/bili_user}', required: false })
    async getArtistWorks(
        @Param('id') id: string,
        @Query('page') page: number,
        @Query('type') type: string,
    ) {
        const artistItem = { id }; // 根据ID获取艺术家信息
        return await this.biliService.getArtistWorks(artistItem, page, type);
    }

    @Get('toplists')
    @ApiOperation({ summary: '获取排行榜列表' })
    async getTopLists() {
        return await this.biliService.getTopLists();
    }

    // @Get('toplist/detail')
    // @ApiOperation({ summary: '获取排行榜详情' })
    // @ApiQuery({ name: 'id', description: '排行榜ID' })
    // async getTopListDetail(@Query('id') id: string) {
    //     const topListItem = { id }; // 根据ID获取排行榜信息
    //     return await this.biliService.getTopListDetail(topListItem);
    // }

    // @Post('import/musicsheet')
    // @ApiOperation({ summary: '导入音乐列表' })
    // @ApiBody({ description: 'URL或ID' })
    // async importMusicSheet(@Body('url') url: string) {
    //     return await this.biliService.importMusicSheet(url);
    // }

    @Get('music/:aid/comments')
    @ApiOperation({ summary: '获取音乐评论' })
    @ApiParam({ name: 'aid', description: '音乐ID' })
    async getMusicComments(@Param('aid') aid: string) {
        const musicItem = { aid }; 
        return await this.biliService.getMusicComments(musicItem);
    }
}