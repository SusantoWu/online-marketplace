/* Parsing Result type from web3 call to object */
export function resultToObject(result, ...args) {
  return args.reduce((accu, key, i) => {
    accu[key] = result[i];
    return accu;
  }, {});
}