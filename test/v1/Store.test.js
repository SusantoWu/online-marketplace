const { expect } = require('chai');
const { expectEvent } = require('@openzeppelin/test-helpers');

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
    it('add a store', async () => {
      const receipt = await this.store.open('Store 1', { from: seller });

      expectEvent(receipt, 'StoreCreated');

      const { '1': name } = await this.store.getStore(0, { from: seller });

      expect(name).to.equal('Store 1');
    });

    it('close a store', async () => {
      await this.store.open('Store 1', { from: seller });

      const receipt = await this.store.close(0, { from: seller });

      expectEvent(receipt, 'StoreRemoved');

      expect((await this.store.getStoreCount({ from: seller })).toString()).to.equal('0');
    });
  });

  describe('products', () => {
    let storeId;

    beforeEach(async () => {
      await this.store.open('Store 1', { from: seller });
      const { '0': id } = await this.store.getStore(0, { from: seller });
      storeId = id;
    });

    it('add a product', async () => {
      const receipt = await this.store.add('Product 1', 1, 2, storeId, { from: seller });

      expectEvent(receipt, 'ProductAdded');

      const { '1': name } = await this.store.getProduct(storeId, 0, { from: seller });

      expect(name).to.equal('Product 1');
    });

    it('update a product price', async () => {
      await this.store.add('Product 1', 1, 2, storeId, { from: seller });

      const receipt = await this.store.update(storeId, 0, 3, { from: seller });

      expectEvent(receipt, 'ProductUpdated');

      const { '3': price } = await this.store.getProduct(storeId, 0, { from: seller });

      expect(price.toString()).to.equal('3');
    });

    it('remove a product', async () => {
      await this.store.add('Product 1', 1, 2, storeId, { from: seller });

      const receipt = await this.store.remove(storeId, 0, { from: seller });

      expectEvent(receipt, 'ProductRemoved');

      expect((await this.store.getProductCount(storeId)).toString()).to.equal('0');
    });

    // TODO: need to check exception on payment _asyncTransfer
    /* it('purchase a product', async () => {
      await this.store.add('Product 1', 1, 2, storeId, { from: seller });

      const { logs } = await this.store.buy(0, 1, { from: buyer, value: 2 });

      expectEvent.inLogs(logs, 'ProductBought', {
        id: 0,
        quantity: 1,
        total: 2,
        buyer
      });
    }); */
  });
});
