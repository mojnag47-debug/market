declare module 'ethers' {
  export class JsonRpcProvider {
    constructor(url?: string);
  }
  export class Wallet {
    constructor(privateKey: string, provider?: JsonRpcProvider);
  }
  export class Contract {
    constructor(address: string, abi: unknown, signerOrProvider?: unknown);
    // minimal mint signature used in code
    mint(to: string, tokenURI: string): Promise<{ wait: () => Promise<{ transactionHash: string }> }>;
  }
  export function getDefaultProvider(network?: string): JsonRpcProvider;
  export const ethers: unknown;
}
