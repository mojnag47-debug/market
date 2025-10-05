declare module 'testcontainers' {
  export class StartedTestContainer {
    stop(): Promise<void>;
    getHost(): string;
    getMappedPort(port: number): number;
  }

  export class GenericContainer {
    constructor(image: string);
    withExposedPorts(port: number): GenericContainer;
    start(): Promise<StartedTestContainer>;
  }

  export class PostgreSqlContainer extends GenericContainer {
    constructor(image?: string);
    withDatabase(db: string): this;
    withUsername(user: string): this;
    withPassword(pass: string): this;
  }
}
