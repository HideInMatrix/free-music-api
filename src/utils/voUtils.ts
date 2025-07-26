// 返回给调用者的视图结构
import { ResultVO } from '@/vo/result.vo';
import { replacer } from './utils';

export class VOUtils {
  public static success<T>(data?: T): ResultVO<T> {
    const resultVo = new ResultVO<T>();
    resultVo.setCode(0);
    resultVo.setMsg('接口调用成功');

    // 处理数据中可能存在的BigInt类型（雪花ID）
    const processedData = data
      ? JSON.parse(JSON.stringify(data, replacer))
      : null;
    resultVo.setData(processedData);
    return resultVo;
  }

  public static error(code: number, msg: string): ResultVO<null> {
    const resultVo = new ResultVO<null>();
    resultVo.setCode(code);
    resultVo.setMsg(msg);
    return resultVo;
  }
}
