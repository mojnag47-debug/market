import { ethers } from 'ethers';
import { executeWithPolicies } from '@nextgen-marketplace/shared-utils';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);

const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS || '';
const nftAbi = [
  'function mint(address to, string memory tokenURI) public returns (uint256)'
];

export async function mintNFT(to: string, tokenURI: string) {
  if (!nftContractAddress) throw new Error('NFT_CONTRACT_ADDRESS not set');
  const contract = new ethers.Contract(nftContractAddress, nftAbi, wallet);

  const tx = await executeWithPolicies(async () => contract.mint(to, tokenURI));

  const receipt = await executeWithPolicies(async () => tx.wait());

  logger.info({ txHash: receipt.transactionHash, to }, 'nft:minted');
  return receipt;
}
