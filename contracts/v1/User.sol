// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

/**
 * @title MarketPlace User
 * @author Susanto Wu
 * @dev Manage all users relations and permissions
 */
contract User is Initializable, OwnableUpgradeable, AccessControlUpgradeable {
    /**
     * @dev Available roles:
     * - Admin: to manage seller.
     * - Seller: to manage stores and products.
     */
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");

    /**
     * @dev Initialize Ownable constructur to set deployer as owner,
     * setup initial AccessControl permissions.
     */
    function initialize() public initializer {
        __Ownable_init();
        __AccessControl_init();

        // Admin can manage each other.
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, owner());

        // Admin can manage Seller.
        _setRoleAdmin(SELLER_ROLE, ADMIN_ROLE);
    }

    /**
     * @dev Throw if function call with owner account.
     */
    modifier accountNotOwner(address account) {
        require(account != owner(), "User: account is owner");
        _;
    }

    /**
     * @dev Add `ADMIN_ROLE` user, will not exposed to UI.
     */
    function addAdmin(address account) public accountNotOwner(account) {
        grantRole(ADMIN_ROLE, account);
    }

    /**
     * @dev Revoke `ADMIN_ROLE` user, will not exposed to UI.
     */
    function revokeAdmin(address account) public accountNotOwner(account) {
        revokeRole(ADMIN_ROLE, account);
    }

    /**
     * @dev Add `SELLER_ROLE` user.
     */
    function addSeller(address account) public accountNotOwner(account) {
        grantRole(SELLER_ROLE, account);
    }

    /**
     * @dev Revoke `SELLER_ROLE` user.
     */
    function revokeSeller(address account) public accountNotOwner(account) {
        revokeRole(SELLER_ROLE, account);
    }

    /**
     * @dev Return true if account is seller, false otherwise.
     */
    function isSeller(address account) external view returns (bool) {
        return hasRole(SELLER_ROLE, account);
    }
}
