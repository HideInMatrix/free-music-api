/**
 * @Author: HideInMatrix
 * @description: 雪花ID生成器
 * @return {*}
 * @Date: 2025-01-08
 */

import { SnowflakeIdv1 } from 'simple-flakeid';

// 创建 Snowflake 实例
const snowflake = new SnowflakeIdv1({ workerId: 1 });

// 生成 ID
/**
 * 生成固定长度的雪花ID
 * @returns 返回固定长度的字符串ID
 */
export const generateId = (): string => {
  // 确保生成的ID为固定长度的字符串（19位）
  return snowflake.NextNumber().toString().padStart(19, '0');
};

export class SnowflakeIdGenerator {
  private static instance: SnowflakeIdGenerator;
  private sequence: number = 0;
  private lastTimestamp: number = -1;

  // Configuration
  private twepoch: number = 1420070400000; // Custom epoch (2015-01-01)
  private workerIdBits: number = 5;
  private datacenterIdBits: number = 5;
  private sequenceBits: number = 12;

  private maxWorkerId: number = -1 ^ (-1 << this.workerIdBits);
  private maxDatacenterId: number = -1 ^ (-1 << this.datacenterIdBits);

  private workerIdShift: number = this.sequenceBits;
  private datacenterIdShift: number = this.sequenceBits + this.workerIdBits;
  private timestampLeftShift: number =
    this.sequenceBits + this.workerIdBits + this.datacenterIdBits;

  private sequenceMask: number = -1 ^ (-1 << this.sequenceBits);

  private workerId: number;
  private datacenterId: number;

  private constructor(workerId: number = 1, datacenterId: number = 1) {
    if (workerId > this.maxWorkerId || workerId < 0) {
      throw new Error(
        `Worker ID can't be greater than ${this.maxWorkerId} or less than 0`,
      );
    }

    if (datacenterId > this.maxDatacenterId || datacenterId < 0) {
      throw new Error(
        `Datacenter ID can't be greater than ${this.maxDatacenterId} or less than 0`,
      );
    }

    this.workerId = workerId;
    this.datacenterId = datacenterId;
  }

  public static getInstance(
    workerId: number = 1,
    datacenterId: number = 1,
  ): SnowflakeIdGenerator {
    if (!SnowflakeIdGenerator.instance) {
      SnowflakeIdGenerator.instance = new SnowflakeIdGenerator(
        workerId,
        datacenterId,
      );
    }
    return SnowflakeIdGenerator.instance;
  }

  private tilNextMillis(lastTimestamp: number): number {
    let timestamp = this.currentTimestamp();
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTimestamp();
    }
    return timestamp;
  }

  private currentTimestamp(): number {
    return Date.now();
  }

  /**
   * 生成下一个雪花ID
   * @returns 返回固定长度的字符串ID
   */
  public nextId(): string {
    let timestamp = this.currentTimestamp();

    if (timestamp < this.lastTimestamp) {
      throw new Error(
        `Clock moved backwards. Refusing to generate ID for ${this.lastTimestamp - timestamp} milliseconds.`,
      );
    }

    if (this.lastTimestamp === timestamp) {
      this.sequence = (this.sequence + 1) & this.sequenceMask;
      if (this.sequence === 0) {
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    const id =
      ((timestamp - this.twepoch) << this.timestampLeftShift) |
      (this.datacenterId << this.datacenterIdShift) |
      (this.workerId << this.workerIdShift) |
      this.sequence;

    // 将数字ID转换为固定长度的字符串（19位）
    return BigInt(id).toString().padStart(19, '0');
  }
}
