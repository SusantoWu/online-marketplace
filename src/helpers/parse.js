import Web3 from "web3";

/* Parsing Result type from web3 call to object */
export function resultToObject(result, ...args) {
  return args.reduce((accu, key, i) => {
    accu[key] = result[i];
    return accu;
  }, {});
}

export function weiToEther(value) {
  return Web3.utils.fromWei(value);
}

export function etherToWei(value) {
  return Web3.utils.toWei(value);
}