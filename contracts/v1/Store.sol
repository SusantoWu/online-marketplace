// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/GSN/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/EnumerableSetUpgradeable.sol";
import "./User.sol";
import "./Payment.sol";

/**
 * @title MarketPlace Store
 * @author Susanto Wu
 * @dev Keep track of store, products in store.
 */
contract Store is Initializable, ContextUpgradeable {
    using SafeMathUpgradeable for uint256;
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.UintSet;

    /**
     * @dev Required contracts.
     */
    User private _user;
    Payment private _payment;

    struct StoreDetails {
        string name;
        address payable seller;
    }

    struct Product {
        string name;
        uint256 quantity;
        uint256 price;
        uint256 storeId;
    }

    /**
     * @dev User can own multiple stores.
     * - Counter to facilitate store identifier
     * - User address to stores list map
     * - Id to Store map
     */
    CountersUpgradeable.Counter storeCounter;
    mapping(address => EnumerableSetUpgradeable.UintSet) private _sellerStores;
    mapping(uint256 => StoreDetails) private _stores;

    /**
     * @dev Store can have multiples products.
     * - Counter to facilitate product identifier
     * - Store Id to products list map
     * - Id to Product map
     */
    CountersUpgradeable.Counter productCounter;
    mapping(uint256 => EnumerableSetUpgradeable.UintSet) private _storeProducts;
    mapping(uint256 => Product) private _products;

    /* Events */
    event StoreCreated(uint256 id, string name, address seller);
    event StoreRemoved(uint256 id, address seller);
    event ProductAdded(
        uint256 id,
        string name,
        uint256 quantity,
        uint256 price,
        uint256 storeId,
        address seller
    );
    event ProductRemoved(uint256 id, uint256 storeId, address seller);
    event ProductUpdated(
        uint256 id,
        uint256 oldPrice,
        uint256 price,
        address seller
    );
    event ProductBought(
        uint256 id,
        uint256 quantity,
        uint256 paid,
        address buyer
    );

    /**
     * @dev Throw if address not seller.
     */
    modifier onlySeller() {
        require(_user.isSeller(_msgSender()), "Store: address is not seller");
        _;
    }

    /**
     * @dev Throw if store not under sender.
     */
    modifier onlyStoreOwner(uint256 storeId) {
        require(
            _sellerStores[_msgSender()].contains(storeId),
            "Store: not belong to sender"
        );
        _;
    }

    /**
     * @dev Throw if sender does not have store.
     */
    modifier hasStore() {
        require(
            _sellerStores[_msgSender()].length() > 0,
            "Store: seller no store"
        );
        _;
    }

    /**
     * @dev Initialize parent constructur.
     */
    function initialize(address user, address payment) public initializer {
        require(user.isContract(), "Store: user address is not contract");
        require(payment.isContract(), "Store: payment address is not contract");

        __Context_init();

        _user = User(user);
        _payment = Payment(payment);
    }

    /**
     * @dev Create a new store front.
     * @param name store name
     */
    function open(string memory name) public onlySeller {
        uint256 id = storeCounter.current();

        if (_sellerStores[_msgSender()].add(id)) {
            _stores[id] = StoreDetails({name: name, seller: _msgSender()});
            storeCounter.increment();
            emit StoreCreated(id, name, _msgSender());
        }
    }

    /**
     * @return number of stores for seller
     */
    function getStoreCount() public view returns (uint256) {
        return _sellerStores[_msgSender()].length();
    }

    /**
     * @param index store set element index
     * @return store id
     * @return store name
     */
    function getStore(uint256 index)
        public
        view
        returns (uint256, string memory)
    {
        uint256 id = getStoreId(index);
        StoreDetails storage store = _stores[id];
        return (id, store.name);
    }

    /**
     * @param index store set element index
     * @return store id
     */
    function getStoreId(uint256 index) public view returns (uint256) {
        return _sellerStores[_msgSender()].at(index);
    }

    /**
     * @dev Remove a store front and products in store.
     * @param id store id
     */
    function close(uint256 id) public onlySeller onlyStoreOwner(id) {
        for (uint256 i = 0; i < _storeProducts[id].length(); i++) {
            remove(id, i);
        }

        if (_sellerStores[_msgSender()].remove(id)) {
            delete (_stores[id]);
            emit StoreRemoved(id, _msgSender());
        }
    }

    /**
     * @dev Add product into store.
     * @param name product name
     * @param quantity product quantity
     * @param price product price
     * @param storeId store identifier
     */
    function add(
        string memory name,
        uint256 quantity,
        uint256 price,
        uint256 storeId
    ) public onlySeller onlyStoreOwner(storeId) {
        require(price > 0);
        require(quantity > 0);

        uint256 id = productCounter.current();

        if (_storeProducts[storeId].add(id)) {
            _products[id] = Product({
                name: name,
                quantity: quantity,
                price: price,
                storeId: storeId
            });
            productCounter.increment();
            emit ProductAdded(id, name, quantity, price, storeId, _msgSender());
        }
    }

    /**
     * @param storeId store identifier
     * @return number of products for store
     */
    function getProductCount(uint256 storeId) public view returns (uint256) {
        return _storeProducts[storeId].length();
    }

    /**
     * @param index product set element index
     * @return product identifier
     * @return product information
     */
    function getProduct(uint256 storeId, uint256 index)
        public
        view
        returns (
            uint256,
            string memory,
            uint256,
            uint256,
            uint256
        )
    {
        uint256 id = getProductId(storeId, index);
        Product storage product = _products[id];
        return (
            id,
            product.name,
            product.quantity,
            product.price,
            product.storeId
        );
    }

    /**
     * @param index product set element index
     * @return product id
     */
    function getProductId(uint256 storeId, uint256 index)
        public
        view
        returns (uint256)
    {
        return _storeProducts[storeId].at(index);
    }

    /**
     * @dev Remove a product
     * @param storeId store identifier
     * @param index product set element index
     */
    function remove(uint256 storeId, uint256 index)
        public
        onlySeller
        onlyStoreOwner(storeId)
    {
        uint256 id = getProductId(storeId, index);
        if (_storeProducts[storeId].remove(id)) {
            delete (_products[id]);
            emit ProductRemoved(id, storeId, _msgSender());
        }
    }

    /**
     * @dev Update a product price
     * @param storeId store identifier
     * @param index product set element index
     * @param price new product price
     */
    function update(
        uint256 storeId,
        uint256 index,
        uint256 price
    ) public onlySeller onlyStoreOwner(storeId) {
        require(price > 0);

        uint256 id = getProductId(storeId, index);
        uint256 oldPrice = _products[id].price;
        _products[id].price = price;

        emit ProductUpdated(id, oldPrice, price, _msgSender());
    }

    // Buyer

    /**
     * @dev Throw if not enough value send.
     */
    modifier paidEnough(uint256 id, uint256 quantity) {
        require(
            msg.value >= _products[id].price.mul(quantity),
            "MarketPlace: insufficient value"
        );
        _;
    }

    /**
     * @dev Throw if not enough stock in product.
     */
    modifier stockEnough(uint256 id, uint256 quantity) {
        require(
            _products[id].quantity >= quantity,
            "MarketPlace: insufficient quantity"
        );
        _;
    }

    /**
     * @dev Send excess amount after substract required price.
     */
    modifier refundExcess(uint256 id, uint256 quantity) {
        _;
        uint256 paid = msg.value;
        uint256 amountToRefund = paid.sub(_products[id].price.mul(quantity));
        if (amountToRefund > 0) {
            AddressUpgradeable.sendValue(_msgSender(), amountToRefund);
        }
    }

    /**
     * @dev Reduce product quantity after bought.
     */
    modifier deductStock(uint256 id, uint256 quantity) {
        _;
        Product storage product = _products[id];
        product.quantity = product.quantity.sub(quantity);
    }

    /**
     * @dev Check value and refund.
     * @param id product identifier
     * @param quantity number of product
     */
    function buy(uint256 id, uint256 quantity)
        public
        payable
        paidEnough(id, quantity)
        refundExcess(id, quantity)
    {
        Product storage product = _products[id];
        uint256 total = product.price.mul(quantity);

        settle(id, quantity, total);

        emit ProductBought(id, quantity, total, _msgSender());
    }

    /**
     * @dev Push payment and deduct stock.
     * @param id product identifier
     * @param quantity number of product
     * @param total pruce to pay
     */
    function settle(
        uint256 id,
        uint256 quantity,
        uint256 total
    ) public payable stockEnough(id, quantity) deductStock(id, quantity) {
        Product storage product = _products[id];

        _payment.pay{value: total}(_stores[product.storeId].seller, total);
    }
}
