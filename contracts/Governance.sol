// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * NextGen Marketplace - Governance & DAO Smart Contract
 * Decentralized governance for marketplace community
 * حاکمیت غیرمتمرکز برای جامعه مارکت‌پلیس
 */

// Governance Token Contract
contract GovernanceToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
    
    function mint(address to, uint256 amount) public {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function addMinter(address minter) public onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) public onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
}

// Main Governance Contract
contract Governance is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // State variables
    Counters.Counter private _proposalIds;
    Counters.Counter private _daoIds;
    
    // Governance parameters
    uint256 public constant VOTING_PERIOD = 17280; // ~3 days in blocks (15s per block)
    uint256 public constant EXECUTION_DELAY = 172800; // ~1 day in blocks
    uint256 public constant QUORUM_PERCENTAGE = 10; // 10% of total supply
    uint256 public constant PROPOSAL_THRESHOLD = 1000 * 10**18; // 1000 tokens to create proposal
    
    // Structs
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        string metadataHash; // IPFS hash for detailed proposal
        uint256 votingStartBlock;
        uint256 votingEndBlock;
        uint256 executionBlock;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        bool cancelled;
        ProposalType proposalType;
        bytes callData;
        address targetContract;
    }
    
    struct DAO {
        uint256 id;
        string name;
        string metadataHash; // IPFS hash for DAO details
        address creator;
        address votingToken;
        uint256 quorum; // percentage
        uint256 votingPeriod; // in blocks
        uint256 executionDelay; // in blocks
        uint256 createdAt;
        bool active;
        address[] members;
        mapping(address => bool) isMember;
        mapping(uint256 => Proposal) proposals;
        Counters.Counter proposalCount;
    }
    
    struct Vote {
        bool hasVoted;
        VoteType voteType;
        uint256 votes;
        uint256 timestamp;
    }
    
    enum ProposalType {
        General,
        TokenMint,
        ParameterChange,
        ContractUpgrade,
        TreasurySpend,
        MemberManagement
    }
    
    enum VoteType {
        Against,
        For,
        Abstain
    }
    
    enum ProposalState {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Queued,
        Executed,
        Cancelled
    }
    
    // Storage mappings
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => DAO) public daos;
    mapping(uint256 => mapping(address => Vote)) public proposalVotes;
    mapping(uint256 => mapping(uint256 => mapping(address => Vote))) public daoProposalVotes;
    mapping(address => string) public didRegistry; // Decentralized Identity
    mapping(string => bool) public governanceTokens;
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address proposer,
        string title,
        uint256 votingStartBlock,
        uint256 votingEndBlock
    );
    
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        VoteType voteType,
        uint256 votes
    );
    
    event ProposalExecuted(uint256 indexed proposalId, bool success);
    
    event DAOCreated(
        uint256 indexed daoId,
        string name,
        address creator,
        address votingToken
    );
    
    event DAOMemberAdded(uint256 indexed daoId, address member);
    
    event DAOMemberRemoved(uint256 indexed daoId, address member);
    
    event DIDRegistered(address indexed user, string did);
    
    event GovernanceTokenCreated(
        address indexed tokenAddress,
        string symbol,
        uint256 totalSupply,
        address creator
    );
    
    constructor() {}
    
    /**
     * Create a governance proposal
     * ایجاد پیشنهاد حاکمیت
     */
    function createProposal(
        string memory title,
        string memory description,
        string memory metadataHash,
        ProposalType proposalType,
        bytes memory callData,
        address targetContract
    ) public returns (uint256) {
        // Require minimum token balance to create proposal
        require(getVotingPower(msg.sender) >= PROPOSAL_THRESHOLD, "Insufficient tokens");
        require(bytes(title).length > 0, "Title required");
        require(bytes(description).length > 0, "Description required");
        
        _proposalIds.increment();
        uint256 proposalId = _proposalIds.current();
        
        uint256 votingStartBlock = block.number + 1;
        uint256 votingEndBlock = votingStartBlock + VOTING_PERIOD;
        uint256 executionBlock = votingEndBlock + EXECUTION_DELAY;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            metadataHash: metadataHash,
            votingStartBlock: votingStartBlock,
            votingEndBlock: votingEndBlock,
            executionBlock: executionBlock,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            executed: false,
            cancelled: false,
            proposalType: proposalType,
            callData: callData,
            targetContract: targetContract
        });
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            votingStartBlock,
            votingEndBlock
        );
        
        return proposalId;
    }
    
    /**
     * Vote on a proposal
     * رای دادن به پیشنهاد
     */
    function vote(uint256 proposalId, VoteType voteType) public {
        require(proposalId <= _proposalIds.current(), "Invalid proposal");
        require(getProposalState(proposalId) == ProposalState.Active, "Voting not active");
        require(!proposalVotes[proposalId][msg.sender].hasVoted, "Already voted");
        
        uint256 votes = getVotingPower(msg.sender);
        require(votes > 0, "No voting power");
        
        Proposal storage proposal = proposals[proposalId];
        
        if (voteType == VoteType.For) {
            proposal.forVotes += votes;
        } else if (voteType == VoteType.Against) {
            proposal.againstVotes += votes;
        } else {
            proposal.abstainVotes += votes;
        }
        
        proposalVotes[proposalId][msg.sender] = Vote({
            hasVoted: true,
            voteType: voteType,
            votes: votes,
            timestamp: block.timestamp
        });
        
        emit VoteCast(msg.sender, proposalId, voteType, votes);
    }
    
    /**
     * Execute a successful proposal
     * اجرای پیشنهاد موفق
     */
    function executeProposal(uint256 proposalId) public {
        require(proposalId <= _proposalIds.current(), "Invalid proposal");
        require(getProposalState(proposalId) == ProposalState.Succeeded, "Proposal not ready for execution");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.number >= proposal.executionBlock, "Execution delay not met");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        
        bool success = true;
        if (proposal.callData.length > 0 && proposal.targetContract != address(0)) {
            (success,) = proposal.targetContract.call(proposal.callData);
        }
        
        emit ProposalExecuted(proposalId, success);
    }
    
    /**
     * Create a DAO
     * ایجاد DAO
     */
    function createDAO(
        string memory name,
        string memory metadataHash,
        address votingToken,
        uint256 quorum,
        uint256 votingPeriod,
        uint256 executionDelay
    ) public returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(votingToken != address(0), "Invalid voting token");
        require(quorum > 0 && quorum <= 100, "Invalid quorum");
        require(votingPeriod > 0, "Invalid voting period");
        
        _daoIds.increment();
        uint256 daoId = _daoIds.current();
        
        DAO storage newDao = daos[daoId];
        newDao.id = daoId;
        newDao.name = name;
        newDao.metadataHash = metadataHash;
        newDao.creator = msg.sender;
        newDao.votingToken = votingToken;
        newDao.quorum = quorum;
        newDao.votingPeriod = votingPeriod;
        newDao.executionDelay = executionDelay;
        newDao.createdAt = block.timestamp;
        newDao.active = true;
        
        // Add creator as first member
        newDao.members.push(msg.sender);
        newDao.isMember[msg.sender] = true;
        
        emit DAOCreated(daoId, name, msg.sender, votingToken);
        emit DAOMemberAdded(daoId, msg.sender);
        
        return daoId;
    }
    
    /**
     * Join a DAO
     * پیوستن به DAO
     */
    function joinDAO(uint256 daoId) public {
        require(daoId <= _daoIds.current(), "Invalid DAO");
        require(daos[daoId].active, "DAO not active");
        require(!daos[daoId].isMember[msg.sender], "Already a member");
        
        DAO storage dao = daos[daoId];
        
        // Check if user has voting tokens
        IERC20 votingToken = IERC20(dao.votingToken);
        require(votingToken.balanceOf(msg.sender) > 0, "No voting tokens");
        
        dao.members.push(msg.sender);
        dao.isMember[msg.sender] = true;
        
        emit DAOMemberAdded(daoId, msg.sender);
    }
    
    /**
     * Create governance token
     * ایجاد توکن حاکمیت
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        bool votingRights,
        address creator
    ) public returns (address) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(symbol).length > 0, "Symbol required");
        require(totalSupply > 0, "Total supply must be positive");
        
        GovernanceToken token = new GovernanceToken(name, symbol);
        
        // Mint initial supply to creator
        token.mint(creator, totalSupply);
        
        // Transfer ownership to creator
        token.transferOwnership(creator);
        
        // Register as governance token if it has voting rights
        if (votingRights) {
            governanceTokens[symbol] = true;
        }
        
        emit GovernanceTokenCreated(
            address(token),
            symbol,
            totalSupply,
            creator
        );
        
        return address(token);
    }
    
    /**
     * Register decentralized identity (DID)
     * ثبت هویت غیرمتمرکز
     */
    function registerDID(address user, string memory didHash) public {
        require(bytes(didHash).length > 0, "DID hash required");
        require(user != address(0), "Invalid user address");
        
        didRegistry[user] = didHash;
        
        emit DIDRegistered(user, didHash);
    }
    
    /**
     * Get proposal state
     * دریافت وضعیت پیشنهاد
     */
    function getProposalState(uint256 proposalId) public view returns (ProposalState) {
        require(proposalId <= _proposalIds.current(), "Invalid proposal");
        
        Proposal memory proposal = proposals[proposalId];
        
        if (proposal.cancelled) {
            return ProposalState.Cancelled;
        }
        
        if (proposal.executed) {
            return ProposalState.Executed;
        }
        
        if (block.number < proposal.votingStartBlock) {
            return ProposalState.Pending;
        }
        
        if (block.number <= proposal.votingEndBlock) {
            return ProposalState.Active;
        }
        
        // Check if proposal succeeded
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 quorumVotes = (getTotalSupply() * QUORUM_PERCENTAGE) / 100;
        
        if (totalVotes < quorumVotes || proposal.forVotes <= proposal.againstVotes) {
            return ProposalState.Defeated;
        }
        
        if (block.number < proposal.executionBlock) {
            return ProposalState.Queued;
        }
        
        return ProposalState.Succeeded;
    }
    
    /**
     * Get voting power for an address
     * دریافت قدرت رای برای یک آدرس
     */
    function getVotingPower(address account) public view returns (uint256) {
        // This is a simplified implementation
        // In practice, you might want to snapshot balances at proposal creation
        return 1000 * 10**18; // Placeholder: 1000 tokens
    }
    
    /**
     * Get total supply of governance tokens
     * دریافت کل عرضه توکن‌های حاکمیت
     */
    function getTotalSupply() public pure returns (uint256) {
        // Placeholder implementation
        return 1000000 * 10**18; // 1 million tokens
    }
    
    /**
     * Get DAO members
     * دریافت اعضای DAO
     */
    function getDAOMembers(uint256 daoId) public view returns (address[] memory) {
        require(daoId <= _daoIds.current(), "Invalid DAO");
        return daos[daoId].members;
    }
    
    /**
     * Get proposal details
     * دریافت جزئیات پیشنهاد
     */
    function getProposal(uint256 proposalId) public view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        ProposalState state
    ) {
        require(proposalId <= _proposalIds.current(), "Invalid proposal");
        
        Proposal memory proposal = proposals[proposalId];
        
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            getProposalState(proposalId)
        );
    }
    
    /**
     * Cancel proposal (only proposer or owner)
     * لغو پیشنهاد (فقط پیشنهاد دهنده یا مالک)
     */
    function cancelProposal(uint256 proposalId) public {
        require(proposalId <= _proposalIds.current(), "Invalid proposal");
        
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized"
        );
        require(getProposalState(proposalId) != ProposalState.Executed, "Cannot cancel executed proposal");
        
        proposal.cancelled = true;
    }
    
    /**
     * Update governance parameters (only through proposal)
     * به‌روزرسانی پارامترهای حاکمیت (فقط از طریق پیشنهاد)
     */
    function updateParameters(
        uint256 newProposalThreshold,
        uint256 newQuorumPercentage
    ) public onlyOwner {
        // This would be called through governance proposal execution
        // Implementation would update the parameters
    }
    
    // Get current proposal count
    function getCurrentProposalId() public view returns (uint256) {
        return _proposalIds.current();
    }
    
    // Get current DAO count
    function getCurrentDAOId() public view returns (uint256) {
        return _daoIds.current();
    }
    
    // Check if address is DAO member
    function isDAOMember(uint256 daoId, address member) public view returns (bool) {
        require(daoId <= _daoIds.current(), "Invalid DAO");
        return daos[daoId].isMember[member];
    }
}