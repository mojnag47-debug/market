declare module 'pino' {
  export type Logger = {
    info: (obj: unknown, msg?: string) => void;
    warn: (obj: unknown, msg?: string) => void;
    error: (obj: unknown, msg?: string) => void;
    debug: (obj: unknown, msg?: string) => void;
  };
  function pino(opts?: unknown): Logger;
  export default pino;
}
