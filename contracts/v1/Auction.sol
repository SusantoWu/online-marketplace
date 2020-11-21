// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/GSN/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "../library/MyEnumerableMap.sol";
import "./User.sol";
import "./Store.sol";

/**
 * @title MarketPlace Auction
 * @author Susanto Wu
 * @dev Keep track of product in auction, auction bids. Provides timing functionality.
 */
contract Auction is Initializable, ContextUpgradeable {
    using SafeMathUpgradeable for uint256;
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using MyEnumerableMap for MyEnumerableMap.AddressToUintMap;

    /**
     * @dev Required contracts.
     */
    User private _user;
    Store private _store;

    struct AuctionDetails {
        uint256 openTime;
        uint256 closeTime;
        uint256 startPrice;
    }

    /**
     * @dev Product to Auction map
     */
    mapping(uint256 => AuctionDetails) private _auctions;

    /**
     * @dev Product Id to bids<address, price> map
     */
    mapping(uint256 => MyEnumerableMap.AddressToUintMap) private _productBids;

    /* Events */
    event AuctionStarted(
        uint256 product,
        uint256 openTime,
        uint256 closeTime,
        uint256 startPrice,
        address seller
    );
    event AuctionEnded(uint256 product, uint256 price, address bidder);
    event Bidded(uint256 product, uint256 price, address bidder);

    /**
     * @dev Throw if address not seller.
     */
    modifier onlySeller() {
        require(_user.isSeller(_msgSender()), "Auction: address is not seller");
        _;
    }

    /**
     * @dev Initialize parent constructor.
     */
    function initialize(address user, address store) public initializer {
        require(user.isContract(), "Auction: user address is not contract");
        require(store.isContract(), "Auction: payment address is not contract");

        __Context_init();

        _user = User(user);
        _store = Store(store);
    }

    /**
     * @dev Create new Auction object and map to product.
     * Validate time arguments as future time and product is not in auction.
     * @param openTime auction start time
     * @param closeTime auction end time
     * @param product product identifier
     * @param startPrice starting auction price
     */
    function start(
        uint256 openTime,
        uint256 closeTime,
        uint256 product,
        uint256 startPrice
    ) public onlySeller {
        require(
            openTime >= block.timestamp,
            "Auction: open time not in future"
        );
        require(
            closeTime > openTime,
            "Auction: close time earlier than open time"
        );
        require(
            !hasAuction(product) || !isOpen(product),
            "Auction: product in auction"
        );

        _auctions[product] = AuctionDetails({
            openTime: openTime,
            closeTime: closeTime,
            startPrice: startPrice
        });
        emit AuctionStarted(
            product,
            openTime,
            closeTime,
            startPrice,
            _msgSender()
        );
    }

    /**
     * @param product product identifier
     * @return auction start time
     * @return auction end time
     * @return auction start price
     * @return auction product id
     */
    function getAuction(uint256 product)
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        AuctionDetails storage auction = _auctions[product];
        return (
            auction.openTime,
            auction.closeTime,
            auction.startPrice,
            product
        );
    }

    /**
     * @dev Add sender bid, increase counter.
     * @param product product identifier
     * @param price bid price
     */
    function bid(uint256 product, uint256 price) public {
        require(isOpen(product), "Auction: has ended");
        require(!hasBidded(product), "Auction: user has bidded");
        require(
            price >= _auctions[product].startPrice,
            "Auction: price lower than start price"
        );

        if (_productBids[product].set(_msgSender(), price)) {
            emit Bidded(product, price, _msgSender());
        }
    }

    /**
     * @param product product identifier
     * @return bids map length
     */
    function getBidCount(uint256 product) public view returns (uint256) {
        return _productBids[product].length();
    }

    /**
     * @param product product identifier
     * @param index bid map element index
     * @return bid address
     * @return bid amount
     */
    function getBid(uint256 product, uint256 index)
        public
        view
        returns (address, uint256)
    {
        return _productBids[product].at(index);
    }

    /**
     * @dev get highest bid and clean up product from auction.
     * @param product product identifier
     */
    function end(uint256 product) public onlySeller {
        require(hasClosed(product), "Auction: in progress");

        (address bidder, uint256 price) = getHighestBid(product);

        // Auction only for ONE quantity.
        _store.settle{value: price}(product, price, 1);

        clear(product);

        emit AuctionEnded(product, price, bidder);
    }

    /**
     * @dev clean up all the mappings
     * @param product product identifier
     */
    function clear(uint256 product) private {
        // Remove bids before other mappings.
        for (uint256 i = 0; i < _productBids[product].length(); i++) {
            (address bidder, ) = getBid(product, i);
            _productBids[product].remove(bidder);
        }

        delete (_productBids[product]);

        delete (_auctions[product]);
    }

    /**
     * @return true if the product has auction regardless open or close, false otherwise.
     */
    function hasAuction(uint256 product) public view returns (bool) {
        return _auctions[product].openTime != 0;
    }

    /**
     * @return true if the auction is open, false otherwise.
     */
    function isOpen(uint256 product) public view returns (bool) {
        require(hasAuction(product));

        AuctionDetails storage auction = _auctions[product];
        return
            block.timestamp >= auction.openTime &&
            block.timestamp <= auction.closeTime;
    }

    /**
     * @dev Checks whether the period in which the auction is open has already elapsed.
     * @return Whether auction period has elapsed
     */
    function hasClosed(uint256 product) public view returns (bool) {
        require(hasAuction(product));

        AuctionDetails storage auction = _auctions[product];
        return block.timestamp > auction.closeTime;
    }

    /**
     * @return true if sender has bid on the product, false otherwise.
     */
    function hasBidded(uint256 product) public view returns (bool) {
        return _productBids[product].contains(_msgSender());
    }

    /**
     * @param product product identifier
     * @return highest bidder account
     * @return highest bidder amount
     */
    function getHighestBid(uint256 product)
        private
        view
        returns (address, uint256)
    {
        address highestBidder = address(0);
        uint256 highestPrice = 0;

        for (uint256 i = 0; i < _productBids[product].length(); i++) {
            (address bidder, uint256 price) = getBid(product, i);
            if (price > highestPrice) {
                highestBidder = bidder;
                highestPrice = price;
            }
        }

        return (highestBidder, highestPrice);
    }
}
