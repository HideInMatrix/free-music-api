/**
 * @Author: HideInMatrix
 * @description: 自定义序列化函数，解决雪花id无法被序列化的问题
 * @param {string} key
 * @param {any} value
 * @return {*}
 * @Date: 2024-09-23
 */
export const replacer = (key: string, value: any) => {
    return typeof value === "bigint" ? value.toString() : value;
  };