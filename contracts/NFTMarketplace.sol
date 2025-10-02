// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * NextGen Marketplace - NFT Smart Contract
 * Enterprise-grade NFT marketplace for physical products
 * یکی از قراردادهای هوشمند NFT مارکت‌پلیس نکست‌جن
 */

contract NFTMarketplace is ERC721, ERC721URIStorage, ERC721Royalty, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    // State Variables
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;
    
    uint256 public listingPrice = 0.025 ether; // Platform fee
    uint256 public constant MAX_ROYALTY = 1000; // 10% maximum royalty
    
    // Supported payment tokens
    mapping(string => address) public supportedTokens;
    
    // Marketplace item structure
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        string currency; // ETH, MATIC, BNB, USDC, USDT
        bool listed;
        uint256 createdAt;
        uint256 listedAt;
    }
    
    // Product authenticity structure
    struct ProductAuthenticity {
        string productId;
        string manufacturer;
        string[] certificates;
        string[] provenance;
        uint256 manufacturedAt;
        bool verified;
    }
    
    // Mapping from token ID to market item
    mapping(uint256 => MarketItem) public marketItems;
    
    // Mapping from token ID to product authenticity
    mapping(uint256 => ProductAuthenticity) public productAuthenticity;
    
    // Mapping to track user verification status
    mapping(address => bool) public verifiedUsers;
    
    // Events
    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        string currency,
        uint256 timestamp
    );
    
    event MarketItemListed(
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        string currency,
        uint256 timestamp
    );
    
    event MarketItemSold(
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price,
        string currency,
        uint256 timestamp
    );
    
    event ProductVerified(
        uint256 indexed tokenId,
        string productId,
        address verifier,
        uint256 timestamp
    );
    
    event UserVerified(
        address indexed user,
        address verifier,
        uint256 timestamp
    );
    
    constructor() ERC721("NextGen Marketplace NFT", "NGNFT") {
        // Initialize supported payment tokens
        supportedTokens["USDC"] = 0xA0b86a33E6441c8C0000000000000000000000;  // Placeholder
        supportedTokens["USDT"] = 0xdAC17F958D2ee523a2206206994597C13D831ec7;  // Placeholder
        supportedTokens["DAI"] = 0x6B175474E89094C44Da98b954EedeAC495271d0F;   // Placeholder
    }
    
    /**
     * Mint NFT for physical product with authenticity data
     * ایجاد NFT برای محصول فیزیکی با داده‌های اصالت
     */
    function mintProductNFT(
        address to,
        string memory tokenURI,
        string memory productId,
        string memory manufacturer,
        string[] memory certificates,
        string[] memory provenance,
        uint256 manufacturedAt,
        uint96 royaltyFeeNumerator
    ) public returns (uint256) {
        require(royaltyFeeNumerator <= MAX_ROYALTY, "Royalty too high");
        require(bytes(productId).length > 0, "Product ID required");
        require(bytes(manufacturer).length > 0, "Manufacturer required");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mint NFT
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Set royalty for creator
        _setTokenRoyalty(newTokenId, to, royaltyFeeNumerator);
        
        // Create market item
        marketItems[newTokenId] = MarketItem(
            newTokenId,
            payable(to),
            payable(to),
            0,
            "ETH",
            false,
            block.timestamp,
            0
        );
        
        // Store product authenticity data
        productAuthenticity[newTokenId] = ProductAuthenticity(
            productId,
            manufacturer,
            certificates,
            provenance,
            manufacturedAt,
            false
        );
        
        emit MarketItemCreated(
            newTokenId,
            to,
            to,
            0,
            "ETH",
            block.timestamp
        );
        
        return newTokenId;
    }
    
    /**
     * List NFT for sale in marketplace
     * فهرست کردن NFT برای فروش در مارکت‌پلیس
     */
    function listItem(
        uint256 tokenId,
        uint256 price,
        string memory currency
    ) public payable nonReentrant {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(price > 0, "Price must be greater than 0");
        require(msg.value == listingPrice, "Must pay listing price");
        require(isValidCurrency(currency), "Invalid currency");
        
        // Transfer NFT to marketplace
        _transfer(msg.sender, address(this), tokenId);
        
        // Update market item
        marketItems[tokenId].seller = payable(msg.sender);
        marketItems[tokenId].owner = payable(address(this));
        marketItems[tokenId].price = price;
        marketItems[tokenId].currency = currency;
        marketItems[tokenId].listed = true;
        marketItems[tokenId].listedAt = block.timestamp;
        
        emit MarketItemListed(
            tokenId,
            msg.sender,
            price,
            currency,
            block.timestamp
        );
    }
    
    /**
     * Purchase NFT from marketplace
     * خرید NFT از مارکت‌پلیس
     */
    function purchaseItem(uint256 tokenId) public payable nonReentrant {
        MarketItem storage item = marketItems[tokenId];
        require(item.listed, "Item not listed");
        require(msg.sender != item.seller, "Cannot buy own item");
        
        uint256 price = item.price;
        address payable seller = item.seller;
        string memory currency = item.currency;
        
        if (keccak256(bytes(currency)) == keccak256(bytes("ETH"))) {
            require(msg.value >= price, "Insufficient payment");
            
            // Handle royalty payment
            (address royaltyRecipient, uint256 royaltyAmount) = royaltyInfo(tokenId, price);
            if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
                payable(royaltyRecipient).transfer(royaltyAmount);
                price -= royaltyAmount;
            }
            
            // Transfer payment to seller
            seller.transfer(price);
            
            // Refund excess payment
            if (msg.value > price) {
                payable(msg.sender).transfer(msg.value - price);
            }
        } else {
            // Handle ERC20 token payments
            require(msg.value == 0, "ETH not required for token payment");
            address tokenContract = supportedTokens[currency];
            require(tokenContract != address(0), "Unsupported token");
            
            IERC20 token = IERC20(tokenContract);
            require(token.transferFrom(msg.sender, address(this), price), "Token transfer failed");
            
            // Handle royalty payment
            (address royaltyRecipient, uint256 royaltyAmount) = royaltyInfo(tokenId, price);
            if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
                token.transfer(royaltyRecipient, royaltyAmount);
                price -= royaltyAmount;
            }
            
            // Transfer tokens to seller
            token.transfer(seller, price);
        }
        
        // Transfer NFT to buyer
        _transfer(address(this), msg.sender, tokenId);
        
        // Update market item
        item.owner = payable(msg.sender);
        item.listed = false;
        
        _itemsSold.increment();
        
        emit MarketItemSold(
            tokenId,
            seller,
            msg.sender,
            item.price,
            currency,
            block.timestamp
        );
    }
    
    /**
     * Cancel marketplace listing
     * لغو فهرست مارکت‌پلیس
     */
    function cancelListing(uint256 tokenId) public nonReentrant {
        MarketItem storage item = marketItems[tokenId];
        require(item.listed, "Item not listed");
        require(item.seller == msg.sender, "Not the seller");
        
        // Transfer NFT back to seller
        _transfer(address(this), msg.sender, tokenId);
        
        // Update market item
        item.owner = payable(msg.sender);
        item.listed = false;
        item.listedAt = 0;
    }
    
    /**
     * Verify product authenticity
     * تأیید اصالت محصول
     */
    function verifyProduct(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        
        productAuthenticity[tokenId].verified = true;
        
        emit ProductVerified(
            tokenId,
            productAuthenticity[tokenId].productId,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * Verify user identity
     * تأیید هویت کاربر
     */
    function verifyUser(address user) public onlyOwner {
        verifiedUsers[user] = true;
        
        emit UserVerified(user, msg.sender, block.timestamp);
    }
    
    /**
     * Get marketplace listing details
     * دریافت جزئیات فهرست مارکت‌پلیس
     */
    function getListing(uint256 tokenId) public view returns (MarketItem memory) {
        require(_exists(tokenId), "Token does not exist");
        return marketItems[tokenId];
    }
    
    /**
     * Get product authenticity data
     * دریافت داده‌های اصالت محصول
     */
    function getProductAuthenticity(uint256 tokenId) public view returns (ProductAuthenticity memory) {
        require(_exists(tokenId), "Token does not exist");
        return productAuthenticity[tokenId];
    }
    
    /**
     * Get all market items for sale
     * دریافت تمام آیتم‌های بازار برای فروش
     */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        
        // Count listed items
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (marketItems[i + 1].listed) {
                itemCount += 1;
            }
        }
        
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (marketItems[i + 1].listed) {
                items[currentIndex] = marketItems[i + 1];
                currentIndex += 1;
            }
        }
        
        return items;
    }
    
    /**
     * Get user's owned NFTs
     * دریافت NFT های متعلق به کاربر
     */
    function fetchMyNFTs(address user) public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        
        // Count user's items
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (marketItems[i + 1].owner == user) {
                itemCount += 1;
            }
        }
        
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (marketItems[i + 1].owner == user) {
                items[currentIndex] = marketItems[i + 1];
                currentIndex += 1;
            }
        }
        
        return items;
    }
    
    /**
     * Update listing price (owner only)
     * به‌روزرسانی قیمت فهرست (فقط مالک)
     */
    function updateListingPrice(uint256 _listingPrice) public onlyOwner {
        listingPrice = _listingPrice;
    }
    
    /**
     * Add supported payment token
     * اضافه کردن توکن پرداخت پشتیبانی‌شده
     */
    function addSupportedToken(string memory symbol, address tokenAddress) public onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        supportedTokens[symbol] = tokenAddress;
    }
    
    /**
     * Withdraw contract balance (owner only)
     * برداشت موجودی قرارداد (فقط مالک)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * Emergency token withdrawal
     * برداشت اضطراری توکن
     */
    function withdrawToken(address token, uint256 amount) public onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
    
    // Internal helper functions
    function isValidCurrency(string memory currency) internal view returns (bool) {
        return (
            keccak256(bytes(currency)) == keccak256(bytes("ETH")) ||
            keccak256(bytes(currency)) == keccak256(bytes("MATIC")) ||
            keccak256(bytes(currency)) == keccak256(bytes("BNB")) ||
            supportedTokens[currency] != address(0)
        );
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage, ERC721Royalty) {
        super._burn(tokenId);
        _resetTokenRoyalty(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    // Get current token ID
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }
    
    // Get total items sold
    function getTotalItemsSold() public view returns (uint256) {
        return _itemsSold.current();
    }
}