const { expect } = require('chai');
const { expectEvent, BN } = require('@openzeppelin/test-helpers');

const User = artifacts.require('v1/User');
const Payment = artifacts.require('v1/Payment');
const Store = artifacts.require('v1/Store');

contract('Store', accounts => {
  const [owner, seller, buyer] = accounts;

  before(async () => {
    this.user = await User.new();
    await this.user.initialize({ from: owner });
    await this.user.addSeller(seller, { from: owner });

    this.payment = await Payment.new();
    await this.payment.initialize(this.user.address);
  });

  beforeEach(async () => {
    this.store = await Store.new();
    await this.store.initialize(this.user.address, this.payment.address);
  });

  describe('seller store', () => {
    const storeName = 'Store 1';
    const storeBN = new BN(0);

    it('add a store', async () => {
      const { logs } = await this.store.open(storeName, { from: seller });

      expectEvent.inLogs(logs, 'StoreCreated', {
        id: storeBN,
        name: storeName,
        seller
      });
    });

    it('close a store', async () => {
      await this.store.open(storeName, { from: seller });

      const { logs } = await this.store.close(storeBN, { from: seller });

      expectEvent.inLogs(logs, 'StoreRemoved', {
        id: storeBN,
        seller
      });
    });
  });

  describe('products', () => {
    let storeId;
    const productName = 'Product 1';
    const productBN = new BN(0);
    const quantityBN = new BN(1);
    const priceBN = new BN(2);
    const newPriceBN = new BN(3);

    beforeEach(async () => {
      await this.store.open('Store 1', { from: seller });
      const { '0': id } = await this.store.getStore(0, { from: seller });
      storeId = id;
    });

    it('add a product', async () => {
      const { logs } = await this.store.add(productName, quantityBN, priceBN, storeId, { from: seller });

      expectEvent.inLogs(logs, 'ProductAdded', {
        id: productBN,
        name: productName,
        quantity: quantityBN,
        price: priceBN,
        storeId,
        seller
      });
    });

    it('update a product price', async () => {
      await this.store.add(productName, quantityBN, priceBN, storeId, { from: seller });

      const { logs } = await this.store.update(storeId, productBN, newPriceBN, { from: seller });

      expectEvent.inLogs(logs, 'ProductUpdated', {
        id: productBN,
        oldPrice: priceBN,
        price: newPriceBN,
        seller
      });
    });

    it('remove a product', async () => {
      await this.store.add(productName, quantityBN, priceBN, storeId, { from: seller });

      const { logs } = await this.store.remove(storeId, productBN, { from: seller });

      expectEvent.inLogs(logs, 'ProductRemoved', {
        id: productBN,
        storeId,
        seller
      });
    });

    it('purchase a product', async () => {
      await this.store.add(productName, quantityBN, priceBN, storeId, { from: seller });

      const { logs } = await this.store.buy(productBN, quantityBN, { from: buyer, value: priceBN });

      expectEvent.inLogs(logs, 'ProductBought', {
        id: productBN,
        quantity: quantityBN,
        paid: priceBN,
        buyer
      });
    });
  });
});
