import { Module } from '@nestjs/common';
import { AppController } from './hello.controller';
import { AppService } from './hello.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class HelloModule {}