import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as dayjs from 'dayjs';
import * as he from 'he';
import * as CryptoJs from 'crypto-js';
import { load } from 'cheerio';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BiliService {
  private cookie: any;
  private img: string;
  private sub: string;
  private syncedTime: Date;
  private w_webid: string;
  private w_webid_date: Date;

  constructor(private readonly httpService: HttpService) {}

  // 基础请求头
  private readonly headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.63',
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
  };

  // 获取CID
  private async getCid(bvid: string, aid: string) {
    const params = bvid ? { bvid } : { aid };
    const response = await firstValueFrom(
      this.httpService.get('https://api.bilibili.com/x/web-interface/view', {
        headers: this.headers,
        params,
      })
    );
    return response.data;
  }

  // 时长转换为秒
  private durationToSec(duration: string | number): number {
    if (typeof duration === 'number') {
      return duration;
    }
    if (typeof duration === 'string') {
      const dur = duration.split(':');
      return dur.reduce((prev, curr) => 60 * prev + +curr, 0);
    }
    return 0;
  }

  // 获取Cookie
  private async getCookie() {
    if (!this.cookie) {
      const response = await firstValueFrom(
        this.httpService.get('https://api.bilibili.com/x/frontend/finger/spi', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/114.0.0.0',
          },
        })
      );
      this.cookie = response.data.data;
    }
    return this.cookie;
  }

  // 添加 searchHeaders 定义
  private readonly searchHeaders = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.63',
    'accept': 'application/json, text/plain, */*',
    'accept-encoding': 'gzip, deflate, br',
    'origin': 'https://search.bilibili.com',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://search.bilibili.com/',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
  };

  // 搜索基础方法
  private async searchBase(keyword: string, page: number, searchType: string) {
    try {
      await this.getCookie();
      const params = {
        context: '',
        page,
        order: '',
        page_size: 20,
        keyword,
        duration: '',
        tids_1: '',
        tids_2: '',
        __refresh__: true,
        _extra: '',
        highlight: 1,
        single_column: 0,
        platform: 'pc',
        from_source: '',
        search_type: searchType,
        dynamic_offset: 0,
      };

      const response = await firstValueFrom(
        this.httpService.get('https://api.bilibili.com/x/web-interface/search/type', {
          headers: {
            ...this.searchHeaders,
            cookie: `buvid3=${this.cookie.b_3};buvid4=${this.cookie.b_4}`,
          },
          params,
        })
      );

      if (response.data.code !== 0) {
        throw new HttpException(
          response.data.message || '搜索失败',
          HttpStatus.BAD_REQUEST
        );
      }

      return response.data.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || '搜索失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 格式化媒体信息
  private formatMedia = (result: any) => {
    const title = he.decode(
      result.title?.replace(/(\<em(.*?)\>)|(\<\/em\>)/g, '') ?? ''
    );
    return {
      id: result.cid ?? result.bvid ?? result.aid,
      aid: result.aid,
      bvid: result.bvid,
      artist: result.author ?? result.owner?.name,
      title,
      alias: title.match(/《(.+?)》/)?.[1],
      album: result.bvid ?? result.aid,
      artwork: result.pic?.startsWith('//')
        ? 'http:'.concat(result.pic)
        : result.pic,
      duration: this.durationToSec(result.duration),
      tags: result.tag?.split(','),
      date: dayjs.unix(result.pubdate || result.created).format('YYYY-MM-DD'),
    };
  };

  // 搜索专辑
  async searchAlbum(keyword: string, page: number) {
    try {
      if (!keyword) {
        throw new HttpException('搜索关键词不能为空', HttpStatus.BAD_REQUEST);
      }
      
      const resultData = await this.searchBase(keyword, page, 'video');
      if (!resultData?.result) {
        return {
          isEnd: true,
          data: [],
        };
      }
      
      const albums = resultData.result.map(this.formatMedia);
      return {
        isEnd: resultData.numResults <= page * 20,
        data: albums,
      };
    } catch (error) {
      throw new HttpException(
        error.message || '搜索专辑失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 获取音源
  async getMediaSource(musicItem: any, quality: string) {
    let cid = musicItem?.cid;
    if (!cid) {
      cid = (await this.getCid(musicItem.bvid, musicItem.aid)).data.cid;
    }

    const _params = musicItem.bvid ? { bvid: musicItem.bvid } : { aid: musicItem.aid };
    
    const response = await firstValueFrom(
      this.httpService.get('https://api.bilibili.com/x/player/playurl', {
        headers: this.headers,
        params: { ..._params, cid, fnval: 16 },
      })
    );
    
    let url;
    if (response.data.data.dash) {
      const audios = response.data.data.dash.audio;
      audios.sort((a: { bandwidth: number; }, b: { bandwidth: number; }) => a.bandwidth - b.bandwidth);
      switch (quality) {
        case 'low':
          url = audios[0].baseUrl;
          break;
        case 'standard':
          url = audios[1].baseUrl;
          break;
        case 'high':
          url = audios[2].baseUrl;
          break;
        case 'super':
          url = audios[3].baseUrl;
          break;
      }
    } else {
      url = response.data.data.durl[0].url;
    }

    const hostUrl = url.substring(url.indexOf('/') + 2);
    return {
      url,
      headers: {
        'user-agent': this.headers['user-agent'],
        'accept': '*/*',
        'host': hostUrl.substring(0, hostUrl.indexOf('/')),
        'accept-encoding': 'gzip, deflate, br',
        'connection': 'keep-alive',
        'referer': `https://www.bilibili.com/video/${musicItem.bvid ?? musicItem.aid ?? ''}`,
      },
    };
  }

  // 混合密钥
  private getMixinKey(e: string) {
    const t: string[] = [];
    [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5,
      49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55,
      40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57,
      62, 11, 36, 20, 34, 44, 52].forEach((r) => {
      e.charAt(r) && t.push(e.charAt(r));
    });
    return t.join('').slice(0, 32);
  }

  // HMAC-SHA256 加密
  private hmacSha256(key: string, message: string): string {
    const hmac = CryptoJs.HmacSHA256(message, key);
    return hmac.toString(CryptoJs.enc.Hex);
  }

  // 获取 B 站票据
  private async getBiliTicket(csrf: string = '') {
    try {
      const ts = Math.floor(Date.now() / 1000);
      const hexSign = this.hmacSha256('XgwSnGZ1p', `ts${ts}`);
      
      const response = await firstValueFrom(
        this.httpService.post('https://api.bilibili.com/bapis/bilibili.api.ticket.v1.Ticket/GenWebTicket', null, {
          params: {
            key_id: 'ec02',
            hexsign: hexSign,
            'context[ts]': ts,
            csrf
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0'
          }
        })
      );

      return response.data.data;
    } catch (error) {
      throw new HttpException(
        error.message || '获取票据失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 获取 WBI Keys
  private async getWBIKeys() {
    if (this.img && this.sub && this.syncedTime && 
        this.syncedTime.getDate() === new Date().getDate()) {
      return { img: this.img, sub: this.sub };
    }

    const data = await this.getBiliTicket('');
    this.img = data.nav.img;
    this.img = this.img.slice(this.img.lastIndexOf('/') + 1, this.img.lastIndexOf('.'));
    this.sub = data.nav.sub;
    this.sub = this.sub.slice(this.sub.lastIndexOf('/') + 1, this.sub.lastIndexOf('.'));
    this.syncedTime = new Date();
    
    return { img: this.img, sub: this.sub };
  }

  // 获取 w_rid
  private async getRid(params: any) {
    const wbiKeys = await this.getWBIKeys();
    const npi = wbiKeys.img + wbiKeys.sub;
    const o = this.getMixinKey(npi);
    const l = Object.keys(params).sort();
    const c = [];

    for (let d = 0; d < l.length; ++d) {
      const [h, p] = [l[d], params[l[d]]];
      if (p && typeof p === 'string') {
        c.push(`${encodeURIComponent(h)}=${encodeURIComponent(p.replace(/[!'()*]/g, ''))}`);
      } else if (p != null) {
        c.push(`${encodeURIComponent(h)}=${encodeURIComponent(p)}`);
      }
    }

    const f = c.join('&');
    return CryptoJs.MD5(f + o).toString();
  }

  // 获取 Web ID
  private async getWWebId(id: string) {
    if (this.w_webid && this.w_webid_date && 
        (Date.now() - this.w_webid_date.getTime() < 1000 * 60 * 60)) {
      return this.w_webid;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://space.bilibili.com/${id}`, {
          headers: {
            'user-agent': this.headers['user-agent']
          }
        })
      );

      const $ = load(response.data);
      const content = $('#__RENDER_DATA__').text();
      const jsonContent = JSON.parse(decodeURIComponent(content));
      
      this.w_webid = jsonContent.access_id;
      this.w_webid_date = new Date();
      return this.w_webid;
    } catch (error) {
      throw new HttpException(
        error.message || '获取 Web ID 失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 获取用户作品
  async getArtistWorks(artistItem: any, page: number, type: string) {
    try {
      const queryHeaders = {
        ...this.headers,
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'origin': 'https://space.bilibili.com',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': `https://space.bilibili.com/${artistItem.id}/video`,
      };

      await this.getCookie();

      const now = Math.round(Date.now() / 1e3);
      const params = {
        mid: artistItem.id,
        ps: 30,
        tid: 0,
        pn: page,
        web_location: 1550101,
        order_avoided: true,
        order: 'pubdate',
        keyword: '',
        platform: 'web',
        dm_img_list: '[]',
        dm_img_str: 'V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ',
        dm_cover_img_str: 'QU5HTEUgKE5WSURJQSwgTlZJRElBIEdlRm9yY2UgR1RYIDE2NTAgKDB4MDAwMDFGOTEpIERpcmVjdDNEMTEgdnNfNV8wIHBzXzVfMCwgRDNEMTEpR29vZ2xlIEluYy4gKE5WSURJQS',
        dm_img_inter: '{"ds":[],"wh":[0,0,0],"of":[0,0,0]}',
        wts: now.toString(),
      };

      const w_rid = await this.getRid(params);
      const response = await firstValueFrom(
        this.httpService.get('https://api.bilibili.com/x/space/wbi/arc/search', {
          headers: {
            ...queryHeaders,
            cookie: `buvid3=${this.cookie.b_3};buvid4=${this.cookie.b_4}`,
          },
          params: {
            ...params,
            w_rid,
          },
        })
      );

      if (response.data.code !== 0) {
        throw new HttpException(
          response.data.message || '获取作品列表失败',
          HttpStatus.BAD_REQUEST
        );
      }

      const resultData = response.data.data;
      const albums = resultData.list.vlist.map(this.formatMedia);

      return {
        isEnd: resultData.page.pn * resultData.page.ps >= resultData.page.count,
        data: albums,
      };
    } catch (error) {
      throw new HttpException(
        error.message || '获取作品列表失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 获取收藏夹
  async getFavoriteList(id: string | number) {
    try {
      const result = [];
      const pageSize = 20;
      let page = 1;

      while (true) {
        const response = await firstValueFrom(
          this.httpService.get('https://api.bilibili.com/x/v3/fav/resource/list', {
            params: {
              media_id: id,
              platform: 'web',
              ps: pageSize,
              pn: page,
            },
          })
        );

        const { medias, has_more } = response.data.data;
        result.push(...medias);

        if (!has_more) {
          break;
        }
        page += 1;
      }

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || '获取收藏夹失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 导入音乐列表
  async importMusicSheet(urlLike: string) {
    try {
      let id = urlLike.match(/^\s*(\d+)\s*$/)?.[1]
        || urlLike.match(/^(?:.*)fid=(\d+).*$/)?.[1]
        || urlLike.match(/\/playlist\/pl(\d+)/i)?.[1]
        || urlLike.match(/\/list\/ml(\d+)/i)?.[1];

      if (!id) {
        throw new HttpException('无效的歌单链接或ID', HttpStatus.BAD_REQUEST);
      }

      const musicSheet = await this.getFavoriteList(id);
      return musicSheet.map(item => ({
        id: item.id,
        aid: item.aid,
        bvid: item.bvid,
        artwork: item.cover,
        title: item.title,
        artist: item.upper?.name,
        album: item.bvid ?? item.aid,
        duration: this.durationToSec(item.duration),
      }));
    } catch (error) {
      throw new HttpException(
        error.message || '导入歌单失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 获取评论列表
  async getMusicComments(musicItem: any) {
    try {
      const params = {
        type: 1,
        mode: 3,
        oid: musicItem.aid,
        plat: 1,
        web_location: 1315875,
        wts: Math.floor(Date.now() / 1000)
      };
      
      const w_rid = await this.getRid(params);
      const response = await firstValueFrom(
        this.httpService.get('https://api.bilibili.com/x/v2/reply/wbi/main', {
          params: {
            ...params,
            w_rid
          }
        })
      );

      const comments = response.data.data.replies.map(this.formatComment);
      return {
        isEnd: true,
        data: comments
      };
    } catch (error) {
      throw new HttpException(
        error.message || '获取评论失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 格式化评论
  private formatComment = (item: any) => {
    const comment = {
      id: item.rpid,
      nickName: item.member?.uname,
      avatar: item.member?.avatar,
      comment: item.content?.message,
      like: item.like,
      createAt: item.ctime * 1000,
      location:[],
      replies: [] as any[],
    };

    if (item.reply_control?.location?.startsWith('IP属地：')) {
      comment['location'] = item.reply_control.location.slice(5);
    }

    if (item.replies?.length) {
      comment['replies'] = item.replies.map(this.formatComment);
    }

    return comment;
  };

  // 搜索艺术家
  async searchArtist(keyword: string, page: number) {
    try {
      const resultData = await this.searchBase(keyword, page, 'bili_user');
      const artists = resultData.result.map((result: { uname: any; mid: any; fans: any; usign: any; upic: string; videos: any; }) => ({
        name: result.uname,
        id: result.mid,
        fans: result.fans,
        description: result.usign,
        avatar: result.upic?.startsWith('//')
          ? `https://${result.upic}`
          : result.upic,
        worksNum: result.videos,
      }));
      
      return {
        isEnd: resultData.numResults <= page * 20,
        data: artists,
      };
    } catch (error) {
      throw new HttpException(
        error.message || '搜索艺术家失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 获取专辑信息
  async getAlbumInfo(albumItem: any) {
    try {
      const cidRes = await this.getCid(albumItem.bvid, albumItem.aid);
      const _ref2 = cidRes?.data ?? {};
      const cid = _ref2.cid;
      const pages = _ref2.pages;

      let musicList;
      if (pages.length === 1) {
        musicList = [{ ...albumItem, cid: cid }];
      } else {
        musicList = pages.map((item: { cid: any; part: any; duration: string | number; }) => ({
          ...albumItem,
          cid: item.cid,
          title: item.part,
          duration: this.durationToSec(item.duration),
          id: item.cid,
        }));
      }

      return {
        musicList,
      };
    } catch (error) {
      throw new HttpException(
        error.message || '获取专辑信息失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 获取排行榜列表
  async getTopLists() {
    try {
      // 入站必刷
      const precious = {
        title: '入站必刷',
        data: [{
          id: 'popular/precious?page_size=100&page=1',
          title: '入站必刷',
          coverImg: 'https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_history.png',
        }],
      };

      // 每周必看
      const weekly = {
        title: '每周必看',
        data: [],
      };

      const weeklyRes = await firstValueFrom(
        this.httpService.get('https://api.bilibili.com/x/web-interface/popular/series/list', {
          headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          },
        })
      );

      weekly.data = weeklyRes.data.data.list.slice(0, 8).map((e: { number: any; subject: any; name: any; }) => ({
        id: `popular/series/one?number=${e.number}`,
        title: e.subject,
        description: e.name,
        coverImg: 'https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_weekly.png',
      }));

      // 排行榜
      const boardKeys = [
        // { id: 'ranking/v2?rid=0&type=all', title: '全站' },
        { id: 'ranking/v2?rid=3&type=all', title: '音乐' },
        // ... 其他分类
      ];

      const board = {
        title: '排行榜',
        data: boardKeys.map((item) => ({
          ...item,
          coverImg: 'https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_rank.png',
        })),
      };

      return [weekly, precious, board];
    } catch (error) {
      throw new HttpException(
        error.message || '获取排行榜列表失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 获取排行榜详情
  async getTopListDetail(topListItem: any) {
  
    // try {
      let cookie = await this.getCookie();
      const response = await firstValueFrom(
        this.httpService.get(`https://api.bilibili.com/x/web-interface/${topListItem.id}`, {
          headers: {
            ...this.headers,
            referer: 'https://www.bilibili.com/',
          },
        })
      );
      console.log(cookie);
      console.log(this.headers);
      
      
      return {
        ...topListItem,
        musicList: response.data.data.list.map(this.formatMedia),
      };
    // } catch (error) {
    //   throw new HttpException(
    //     error.message || '获取排行榜详情失败',
    //     error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
    //   );
    // }
  }
}
