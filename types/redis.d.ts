declare module 'redis' {
  export interface RedisClientType {
    isOpen: boolean;
    connect(): Promise<void>;
    quit(): Promise<void>;
    ping(): Promise<string>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, opts?: { EX?: number } & Record<string, unknown>): Promise<'OK' | null>;
    del(key: string): Promise<number>;
    rPush(key: string, value: string): Promise<number>;
    brPop(key: string, timeout: number): Promise<{ key: string; element: string } | null>;
  }
}
