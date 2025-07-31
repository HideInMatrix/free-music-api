import { Module } from "@nestjs/common";
import { BiliController } from "./bili.controller";
import { BiliService } from "./bili.service";
import { HttpModule } from "@nestjs/axios";


@Module({
    imports: [HttpModule],
    controllers: [BiliController],
    providers: [BiliService],
    exports: [BiliService],
})
export class BiliModule{}