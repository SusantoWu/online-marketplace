const { expect } = require('chai');
const { time, BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const User = artifacts.require('v1/User');
const Payment = artifacts.require('v1/Payment');
const Auction = artifacts.require('v1/Auction');
const Store = artifacts.require('v1/Store');

contract('Auction', accounts => {
  const [owner, seller, buyer1, buyer2] = accounts;
  const priceBN = new BN(1);
  const productBN = new BN(2);

  before(async () => {
    await time.advanceBlock();

    this.user = await User.new();
    await this.user.initialize({ from: owner });
    await this.user.addSeller(seller, { from: owner });

    this.payment = await Payment.new();
    await this.payment.initialize(this.user.address);

    this.store = await Store.new();
    await this.store.initialize(this.user.address, this.payment.address);
  });

  beforeEach(async () => {
    this.openingTime = (await time.latest()).add(time.duration.hours(1));
    this.closingTime = this.openingTime.add(time.duration.hours(1));
    this.afterOpeningTime = this.openingTime.add(time.duration.seconds(1));
    this.afterClosingTime = this.closingTime.add(time.duration.seconds(1));
    this.auction = await Auction.new();
    await this.auction.initialize(this.user.address, this.store.address);
    await this.auction.start(this.openingTime, this.closingTime, productBN, priceBN, { from: seller });
  });

  it('start', async () => {
    expect(await this.auction.hasAuction(productBN)).to.equal(true);
  });

  it('operating state', async () => {
    await time.increaseTo(this.afterOpeningTime);
    expect(await this.auction.isOpen(productBN)).to.equal(true);
    expect(await this.auction.hasClosed(productBN)).to.equal(false);

    await time.increaseTo(this.afterClosingTime);
    expect(await this.auction.isOpen(productBN)).to.equal(false);
    expect(await this.auction.hasClosed(productBN)).to.equal(true);
  });

  it('bid', async () => {
    await time.increaseTo(this.afterOpeningTime);
    const receipt = await this.auction.bid(productBN, new BN(2), { from: buyer1 });

    expectEvent(receipt, 'Bidded');

    expect(await this.auction.hasBidded(productBN, { from: buyer1 })).to.equal(true);
  });

  it('bid multiple times', async () => {
    await time.increaseTo(this.afterOpeningTime);
    await this.auction.bid(productBN, new BN(2), { from: buyer1 });

    await expectRevert(this.auction.bid(productBN, new BN(2), { from: buyer1 }), 'Auction: user has bidded');
  });

  // TODO: need to check exception on payment _asyncTransfer
  /* it('end', async () => {
    await time.increaseTo(this.afterOpeningTime);
    await this.auction.bid(productBN, new BN(2), { from: buyer1 });
    await this.auction.bid(productBN, new BN(3), { from: buyer2 });

    await time.increaseTo(this.afterClosingTime);
    const { logs } = await this.auction.end(productBN, { from: seller });

    expectEvent.inLogs(logs, 'AuctionEnded', { bidder: buyer2, price: new BN(3) });
  }); */
});