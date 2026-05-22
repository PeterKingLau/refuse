const config: {
  base_url: {
    base: string
    dev: string
    pro: string
    test: string
  }
  result_code: number | string
  default_headers: AxiosHeaders
  request_timeout: number
} = {
  /**
   * api请求基础路径
   */
  base_url: {
    // 开发环境接口前缀
    base: '/api',

    // 打包开发环境接口前缀
    dev: 'http://localhost:8080',

    // 打包生产环境接口前缀
    pro: 'https://www.hxdqb.com/api',
    //pro: 'http://8.222.139.237:8080',
    // 打包测试环境接口前缀
    test: 'http://47.109.32.193:8080'
  },

  /**
   * 接口成功返回状态码
   */
  result_code: 200,

  /**
   * 接口请求超时时间
   */
  request_timeout: 60000,

  /**
   * 默认接口请求类型
   * 可选值：application/x-www-form-urlencoded multipart/form-data
   */
  default_headers: 'application/x-www-form-urlencoded'
}

export { config }
