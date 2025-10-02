import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";
import dotenv from "dotenv";

dotenv.config();

/**
 * NextGen Marketplace - Hardhat Configuration
 * Blockchain deployment and development configuration
 * پیکربندی بلاک‌چین و توسعه هارد‌هت
 */

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  
  networks: {
    // Local development
    hardhat: {
      chainId: 1337,
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true,
      accounts: {
        mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
        count: 20,
        accountsBalance: "10000000000000000000000", // 10,000 ETH
      },
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    
    // Ethereum networks
    mainnet: {
      url: process.env.ETHEREUM_MAINNET_RPC || "https://mainnet.infura.io/v3/your-project-id",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
      gasPrice: 20000000000, // 20 gwei
    },
    
    sepolia: {
      url: process.env.ETHEREUM_SEPOLIA_RPC || "https://sepolia.infura.io/v3/your-project-id",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: 10000000000, // 10 gwei
    },
    
    // Polygon networks
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC || "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: 30000000000, // 30 gwei
    },
    
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: 10000000000, // 10 gwei
    },
    
    // BSC networks
    bsc: {
      url: process.env.BSC_MAINNET_RPC || "https://bsc-dataseed1.binance.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 56,
      gasPrice: 5000000000, // 5 gwei
    },
    
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 97,
      gasPrice: 10000000000, // 10 gwei
    },
    
    // Arbitrum networks
    arbitrum: {
      url: process.env.ARBITRUM_MAINNET_RPC || "https://arb1.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42161,
      gasPrice: 100000000, // 0.1 gwei
    },
    
    arbitrumGoerli: {
      url: process.env.ARBITRUM_GOERLI_RPC || "https://goerli-rollup.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421613,
      gasPrice: 100000000, // 0.1 gwei
    },
  },
  
  namedAccounts: {
    deployer: {
      default: 0,
      mainnet: process.env.DEPLOYER_ADDRESS || 0,
      polygon: process.env.DEPLOYER_ADDRESS || 0,
      bsc: process.env.DEPLOYER_ADDRESS || 0,
    },
    admin: {
      default: 1,
      mainnet: process.env.ADMIN_ADDRESS || 1,
      polygon: process.env.ADMIN_ADDRESS || 1,
      bsc: process.env.ADMIN_ADDRESS || 1,
    },
    treasury: {
      default: 2,
      mainnet: process.env.TREASURY_ADDRESS || 2,
      polygon: process.env.TREASURY_ADDRESS || 2,
      bsc: process.env.TREASURY_ADDRESS || 2,
    },
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 20,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      arbitrumGoerli: process.env.ARBISCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "arbitrumGoerli",
        chainId: 421613,
        urls: {
          apiURL: "https://api-goerli.arbiscan.io/api",
          browserURL: "https://goerli.arbiscan.io",
        },
      },
    ],
  },
  
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  
  paths: {
    sources: "../contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./deploy",
  },
  
  mocha: {
    timeout: 60000,
    reporter: "spec",
  },
  
  typechain: {
    outDir: "./typechain-types",
    target: "ethers-v5",
  },
};

export default config;