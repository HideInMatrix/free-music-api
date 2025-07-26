import { Module } from '@nestjs/common';

import { YTMusicModule } from './ytmusic/ytmusic.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ YTMusicModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),],
  controllers: [],
  providers: [],
})
export class AppModule { }
