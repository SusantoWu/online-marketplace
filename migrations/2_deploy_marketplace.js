const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const User = artifacts.require('v1/User');
const Payment = artifacts.require('v1/Payment');
const Store = artifacts.require('v1/Store');
const Auction = artifacts.require('v1/Auction');

module.exports = async deployer => {
  const userInstance = await deployProxy(User, { deployer, unsafeAllowCustomTypes: true });

  // Required User
  const paymentInstance = await deployProxy(
    Payment,
    [userInstance.address],
    { deployer, unsafeAllowCustomTypes: true }
  );

  // Required User, Payment
  const storeInstance = await deployProxy(
    Store,
    [userInstance.address, paymentInstance.address],
    { deployer, unsafeAllowCustomTypes: true }
  );

  // Required User, Store
  await deployProxy(
    Auction,
    [userInstance.address, storeInstance.address],
    { deployer, unsafeAllowCustomTypes: true }
  );
};