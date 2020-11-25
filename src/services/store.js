import { connectWeb3 } from "./web3";
import StoreContract from "../contracts/Store.json";
import { resultToObject } from '../helpers/parse';

let contract = null;

const getContract = async () => {
  if (contract) {
    return contract;
  }

  const web3 = await connectWeb3();
  const networkId = await web3.eth.net.getId();

  const deployedNetwork = StoreContract.networks[networkId];
  return new web3.eth.Contract(
    StoreContract.abi,
    deployedNetwork && deployedNetwork.address,
  );
}

const parseProduct = (response) => {
  return resultToObject(response, 'id', 'name', 'quantity', 'price', 'storeId');
}

export const getStores = async (sender) => {
  const storeContract = await getContract();
  const count = await storeContract.methods.getStoreCount().call({ from: sender });
  const stores = [];
  for (let i = 0; i < count; i++) {
    stores.push(storeContract.methods.getStore(i).call({ from: sender })
      .then((response) => resultToObject(response, 'id', 'name'))
    );
  }
  return Promise.all(stores);
}

export const addStore = async (storeName, sender) => {
  const storeContract = await getContract();
  return storeContract.methods.open(storeName).send({ from: sender });
}

export const deleteStore = async (storeId, sender) => {
  const storeContract = await getContract();
  return storeContract.methods.close(storeId).send({ from: sender });
}

export const getStoreProducts = async (storeId, sender) => {
  const storeContract = await getContract();
  const count = await storeContract.methods.getStoreProductCount(storeId).call({ from: sender });
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push(storeContract.methods.getStoreProduct(storeId, i).call({ from: sender })
      .then(parseProduct)
    );
  }
  return Promise.all(products);
}

export const addProduct = async (name, quantity, price, storeId, sender) => {
  const storeContract = await getContract();
  return storeContract.methods.add(name, quantity, price, storeId).send({ from: sender });
}

export const deleteProduct = async (storeId, productId, sender) => {
  const storeContract = await getContract();
  return storeContract.methods.remove(storeId, productId).send({ from: sender });
}

export const updateProduct = async (storeId, productId, price, sender) => {
  const storeContract = await getContract();
  return storeContract.methods.update(storeId, productId, price).send({ from: sender });
}

export const getProducts = async (page, count, sender) => {
  const storeContract = await getContract();
  const paginate = resultToObject(
    await storeContract.methods.getProductPaginate(page, count).call({ from: sender }), 'start', 'end', 'prev', 'next'
  );
  const products = [];
  for (let i = parseInt(paginate.start); i < parseInt(paginate.end); i++) {
    products.push(storeContract.methods.getProductListProduct(i).call({ from: sender })
      .then(parseProduct)
    );
  }
  return Promise.all(products)
    .then((data) => ({ data, prev: paginate.prev, next: paginate.next }));
}

export const buyProduct = async (productId, quantity, total, sender) => {
  const storeContract = await getContract();
  return storeContract.methods.buy(productId, quantity).send({ from: sender, value: total });
}

export const subscribeEvent = async (eventname, callback, filter) => {
  const storeContract = await getContract();
  return storeContract.events[eventname]({ filter })
    .on('data', (event) => {
      if (callback.data) {
        callback.data(event);
      }
    })
    .on('changed', (event) => {
      if (callback.changed) {
        callback.changed(event);
      }
    })
    .on('error', (error) => {
      if (callback.error) {
        callback.error(error)
      }
      console.error(error)
    });
}
