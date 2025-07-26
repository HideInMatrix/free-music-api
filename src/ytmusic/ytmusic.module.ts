import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { YTMusicService } from './ytmusic.service';
import { YTMusicController } from './ytmusic.controller';


@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [YTMusicController],
  providers: [YTMusicService],
  exports: [YTMusicService],
})
export class YTMusicModule {}