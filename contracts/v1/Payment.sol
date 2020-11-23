// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/GSN/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/payment/PullPaymentUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "./User.sol";

/**
 * @title MarketPlace Payments
 * @author Susanto Wu
 * @dev Keep track of payments using pull payment pattern.
 */
contract Payment is
    Initializable,
    ContextUpgradeable,
    PullPaymentUpgradeable,
    ReentrancyGuardUpgradeable
{
    using AddressUpgradeable for address;

    /**
     * @dev Required contracts.
     */
    User private _user;

    /**
     * @dev Throw if address not seller.
     */
    modifier onlySeller(address account) {
        require(isSeller(account), "Payment: address is not seller");
        _;
    }

    /**
     * @dev Initialize parent constructur.
     */
    function initialize(address user) public initializer {
        require(user.isContract(), "Payment: user address is not contract");

        __PullPayment_init();
        __ReentrancyGuard_init();

        _user = User(user);
    }

    function isSeller(address account) private view returns (bool) {
        return _user.isSeller(account);
    }

    /**
     * @dev Check store payments and release to sender address.
     */
    function withdraw() public onlySeller(_msgSender()) nonReentrant {
        require(payments(_msgSender()) > 0, "Payment: no fund to withdraw");

        withdrawPayments(_msgSender());
    }

    /**
     * @dev Add payment to payee address.
     */
    function pay(address payee, uint256 amount)
        public
        payable
        onlySeller(payee)
    {
        _asyncTransfer(payee, amount);
    }
}
