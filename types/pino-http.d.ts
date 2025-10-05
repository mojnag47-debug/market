declare module 'pino-http' {
  import { Logger } from 'pino';
  function pinoHttp(opts?: { logger?: Logger } | Logger): import('express').RequestHandler;
  export default pinoHttp;
}
