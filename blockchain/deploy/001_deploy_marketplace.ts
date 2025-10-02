import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { verify } from "../utils/verify";

/**
 * NextGen Marketplace - Smart Contract Deployment Script
 * Deploy NFT Marketplace and Governance contracts
 * اسکریپت استقرار قراردادهای هوشمند مارکت‌پلیس
 */

const deployMarketplace: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer, admin, treasury } = await getNamedAccounts();

  const chainId = network.config.chainId!;
  const isDevelopment = chainId === 31337 || chainId === 1337;

  log("----------------------------------------------------");
  log(`Deploying NextGen Marketplace contracts to ${network.name}...`);
  log(`Chain ID: ${chainId}`);
  log(`Deployer: ${deployer}`);
  log(`Admin: ${admin}`);
  log(`Treasury: ${treasury}`);
  log("----------------------------------------------------");

  // Deploy Governance Token first
  log("Deploying Governance Token...");
  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    args: ["NextGen Governance Token", "NGGT"],
    log: true,
    waitConfirmations: isDevelopment ? 1 : 6,
  });

  log(`Governance Token deployed at: ${governanceToken.address}`);

  // Deploy Main Governance Contract
  log("Deploying Governance Contract...");
  const governance = await deploy("Governance", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: isDevelopment ? 1 : 6,
  });

  log(`Governance Contract deployed at: ${governance.address}`);

  // Deploy NFT Marketplace Contract
  log("Deploying NFT Marketplace...");
  const nftMarketplace = await deploy("NFTMarketplace", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: isDevelopment ? 1 : 6,
  });

  log(`NFT Marketplace deployed at: ${nftMarketplace.address}`);

  // Get contract instances
  const governanceTokenContract = await ethers.getContractAt("GovernanceToken", governanceToken.address);
  const governanceContract = await ethers.getContractAt("Governance", governance.address);
  const nftMarketplaceContract = await ethers.getContractAt("NFTMarketplace", nftMarketplace.address);

  // Initial setup
  log("Performing initial setup...");

  try {
    // Setup governance token minting permissions
    log("Setting up governance token permissions...");
    const addMinterTx = await governanceTokenContract.addMinter(governance.address);
    await addMinterTx.wait(1);
    log("✅ Governance contract added as minter");

    // Mint initial governance tokens to treasury
    const initialSupply = ethers.utils.parseEther("1000000"); // 1M tokens
    log(`Minting ${ethers.utils.formatEther(initialSupply)} tokens to treasury...`);
    const mintTx = await governanceTokenContract.mint(treasury, initialSupply);
    await mintTx.wait(1);
    log("✅ Initial tokens minted to treasury");

    // Setup marketplace supported tokens (if not development)
    if (!isDevelopment) {
      log("Adding supported payment tokens...");
      
      // Add USDC support
      const usdcAddress = getTokenAddress(chainId, "USDC");
      if (usdcAddress) {
        const addUSDCTx = await nftMarketplaceContract.addSupportedToken("USDC", usdcAddress);
        await addUSDCTx.wait(1);
        log("✅ USDC added as supported token");
      }

      // Add USDT support
      const usdtAddress = getTokenAddress(chainId, "USDT");
      if (usdtAddress) {
        const addUSDTTx = await nftMarketplaceContract.addSupportedToken("USDT", usdtAddress);
        await addUSDTTx.wait(1);
        log("✅ USDT added as supported token");
      }

      // Add DAI support
      const daiAddress = getTokenAddress(chainId, "DAI");
      if (daiAddress) {
        const addDAITx = await nftMarketplaceContract.addSupportedToken("DAI", daiAddress);
        await addDAITx.wait(1);
        log("✅ DAI added as supported token");
      }
    }

    // Create initial DAO for marketplace governance
    log("Creating marketplace DAO...");
    const createDAOTx = await governanceContract.createDAO(
      "NextGen Marketplace DAO",
      "QmNextGenMarketplaceDAO", // IPFS hash placeholder
      governanceToken.address,
      10, // 10% quorum
      17280, // ~3 days voting period
      172800 // ~1 day execution delay
    );
    await createDAOTx.wait(1);
    log("✅ Marketplace DAO created");

  } catch (error) {
    log(`❌ Setup error: ${error}`);
  }

  // Verify contracts on Etherscan (if not development)
  if (!isDevelopment && process.env.ETHERSCAN_API_KEY) {
    log("Verifying contracts on Etherscan...");
    
    try {
      await verify(governanceToken.address, ["NextGen Governance Token", "NGGT"]);
      log("✅ Governance Token verified");
    } catch (error) {
      log(`❌ Governance Token verification failed: ${error}`);
    }

    try {
      await verify(governance.address, []);
      log("✅ Governance Contract verified");
    } catch (error) {
      log(`❌ Governance Contract verification failed: ${error}`);
    }

    try {
      await verify(nftMarketplace.address, []);
      log("✅ NFT Marketplace verified");
    } catch (error) {
      log(`❌ NFT Marketplace verification failed: ${error}`);
    }
  }

  // Save deployment addresses
  log("Saving deployment information...");
  const deploymentInfo = {
    network: network.name,
    chainId,
    timestamp: new Date().toISOString(),
    deployer,
    admin,
    treasury,
    contracts: {
      GovernanceToken: {
        address: governanceToken.address,
        args: ["NextGen Governance Token", "NGGT"],
      },
      Governance: {
        address: governance.address,
        args: [],
      },
      NFTMarketplace: {
        address: nftMarketplace.address,
        args: [],
      },
    },
  };

  // Write to deployment file
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "..", "deployments", network.name);
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  log("----------------------------------------------------");
  log("✅ NextGen Marketplace deployment completed!");
  log(`📄 Governance Token: ${governanceToken.address}`);
  log(`📄 Governance Contract: ${governance.address}`);
  log(`📄 NFT Marketplace: ${nftMarketplace.address}`);
  log(`💾 Deployment info saved to: deployments/${network.name}/deployment.json`);
  log("----------------------------------------------------");

  // Return deployment addresses for other scripts
  return {
    governanceToken: governanceToken.address,
    governance: governance.address,
    nftMarketplace: nftMarketplace.address,
  };
};

// Helper function to get token addresses by chain
function getTokenAddress(chainId: number, token: string): string | null {
  const tokenAddresses: { [chainId: number]: { [token: string]: string } } = {
    // Ethereum Mainnet
    1: {
      USDC: "0xA0b86a33E6441c8C0B6c4E8f5c5d3a5a5d5a5d5a",
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
    // Ethereum Sepolia
    11155111: {
      USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
      DAI: "0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6",
    },
    // Polygon Mainnet
    137: {
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    },
    // Polygon Mumbai
    80001: {
      USDC: "0xe11A86849d99F524cAC3E7A0Ec1241828e332C62",
      USDT: "0x3813e82e6f7098b9583FC0F33a962D02018B6803",
      DAI: "0x27a44456bEDb94DbD59D0f0A14fE977c777fC5D3",
    },
    // BSC Mainnet
    56: {
      USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      USDT: "0x55d398326f99059fF775485246999027B3197955",
      DAI: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    },
    // BSC Testnet
    97: {
      USDC: "0x64544969ed7EBf5f083679233325356EbE738930",
      USDT: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
      DAI: "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867",
    },
  };

  return tokenAddresses[chainId]?.[token] || null;
}

deployMarketplace.tags = ["NextGenMarketplace", "Governance", "NFTMarketplace"];

export default deployMarketplace;