import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ description: '状态码，0表示成功，其他值表示失败', example: 0 })
  code: number;

  @ApiProperty({ description: '接口返回消息', example: '接口调用成功' })
  msg: string;

  @ApiProperty({ description: '返回的数据', example: null })
  data: T | null;
}