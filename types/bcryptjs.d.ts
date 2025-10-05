declare module 'bcryptjs' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string> | string;
  export function compare(data: string, encrypted: string): Promise<boolean> | boolean;
}
