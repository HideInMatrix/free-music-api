import { Module } from '@nestjs/common';

import { YTMusicModule } from './ytmusic/ytmusic.module';
import { ConfigModule } from '@nestjs/config';
import { HelloModule } from './hello/hello.module';

@Module({
  imports: [ YTMusicModule,
    HelloModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),],
  controllers: [],
  providers: [],
})
export class AppModule { }
