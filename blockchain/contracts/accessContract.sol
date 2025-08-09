// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

contract AccessContract is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    
    string public constant VERSION = "1.0.1";

    enum ResourceType {
        URL,
        IPFS
    }
    
    struct Resource {
        address owner;
        string name;
        string description;
        string cid;
        string url; 
        string serviceId;
        uint256 price;
        bool isActive; 
        ResourceType resourceType;
        uint256 createdAt; 
    }

    struct Access {
        uint256 amountPaid;
        uint256 purchasedAt;
    }

    uint256 public nextResourceId;

    mapping(uint256 => Resource) public resources;
    mapping(address => mapping(uint256 => Access)) public buyerAccess;
    mapping(address => uint256) public sellerBalances;

    uint256[] public resourceIds; // tracks resourceId list


    event ResourceCreated(uint256 resourceId, address indexed owner, string name, string description, string cid, string url, string serviceId, uint256 price, uint256 createdAt, ResourceType resourceType);
    event AccessPurchased(uint256 resourceId, address indexed buyer, uint256 amountPaid, uint256 purchasedAt);
    event Withdrawal(address indexed seller, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        nextResourceId = 0;
    }

    function createResource(string calldata name, string calldata description, string calldata cid, string calldata url, string calldata serviceId, uint256 price, ResourceType resourceType) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(name).length <= 200, "Name too long (max 200 bytes)");
        require(bytes(description).length <= 1500, "Description too long (max 1500 bytes)");
        require(bytes(cid).length <= 100, "CID too long (max 100 bytes)");
        require(bytes(url).length <= 500, "URL too long (max 500 bytes)");
        require(bytes(serviceId).length <= 100, "ServiceId too long (max 100 bytes)");
        require(price > 0, "Price must be greater than 0");
        
        uint256 currentResourceId = nextResourceId;
        uint256 currentTime = block.timestamp;
        
        // Create resource step by step to avoid stack too deep
        Resource storage newResource = resources[currentResourceId];
        newResource.owner = msg.sender;
        newResource.name = name;
        newResource.description = description;
        newResource.cid = cid;
        newResource.url = url;
        newResource.serviceId = serviceId;
        newResource.price = price;
        newResource.isActive = true;
        newResource.resourceType = resourceType;
        newResource.createdAt = currentTime;

        resourceIds.push(currentResourceId);

        emit ResourceCreated(currentResourceId, msg.sender, name, description, cid, url, serviceId, price, currentTime, resourceType);
        nextResourceId++;
    }

    // Buyer pays for access
    function buyAccess(uint256 resourceId) external payable {
        Resource memory res = resources[resourceId];
        require(res.owner != address(0), "Resource does not exist");
        require(res.isActive, "Resource not active");
        require(msg.value == res.price, "Incorrect payment");


        buyerAccess[msg.sender][resourceId] = Access({
            amountPaid: msg.value,
            purchasedAt: block.timestamp
        });
        

        sellerBalances[res.owner] += msg.value;

        emit AccessPurchased(resourceId, msg.sender, msg.value, block.timestamp);
    }

    function _hasAccess(address user, uint256 resourceId) internal view returns (bool) {
        if (user == resources[resourceId].owner) {
            return true;
        }
        
        Access memory userAccess = buyerAccess[user][resourceId];
        
        // User has access if they've purchased it (purchasedAt > 0)
        return userAccess.purchasedAt > 0;
    }

    function hasAccess(address user, uint256 resourceId) external view returns (bool) {
        return _hasAccess(user, resourceId);
    }

    function withdraw() external nonReentrant {
        uint256 amount = sellerBalances[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        sellerBalances[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }

    // Get all resource listings (for frontend display)
    function getAllResources() external view returns (Resource[] memory) {
        uint256 count = resourceIds.length; // Now only shows active resources
        Resource[] memory all = new Resource[](count);
        for (uint256 i = 0; i < count; i++) {
            all[i] = resources[resourceIds[i]];
        }
        return all;
    }

    function getResource(uint256 resourceId) external view returns (Resource memory) {
        require(resources[resourceId].owner != address(0), "Resource does not exist");
        return resources[resourceId];
    }

    function getAllResourceIds() external view returns (uint256[] memory) {
        return resourceIds;
    }

    function emergencyDeactivateResource(uint256 resourceId) external onlyOwner {
        resources[resourceId].isActive = false;
    }

    function resourceExists(uint256 resourceId) external view returns (bool) {
        return resources[resourceId].owner != address(0);
    }

}
