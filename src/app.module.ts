import { Module } from '@nestjs/common';

import { YTMusicModule } from './ytmusic/ytmusic.module';
import { BiliModule } from './bili/bili.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    BiliModule, 
    YTMusicModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),],
  controllers: [],
  providers: [],
})
export class AppModule { }
