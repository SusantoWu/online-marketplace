import Web3 from "web3";

const getWeb3 = () => {
  // Modern dapp browsers...
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      return web3;
    } catch (error) {
      throw error;
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    // Use Mist/MetaMask's provider.
    const web3 = window.web3;
    return web3;
  }
  // Fallback to localhost; use dev console port by default...
  else {
    const provider = new Web3.providers.HttpProvider(
      "http://127.0.0.1:8545"
    );
    const web3 = new Web3(provider);
    return web3;
  }
}

const connectWeb3Onload = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", () => {
      try {
        const web3 = getWeb3();
        resolve(web3);
      } catch (error) {
        reject(error);
      }
    });
  });

const connectWeb3 = () =>
  new Promise((resolve, reject) => {
    try {
      const web3 = getWeb3();
      resolve(web3);
    } catch (error) {
      reject(error);
    }
  });

const subscribeMetamask = (callback) => {
  if (callback.accountChanged) {
    window.ethereum.on('accountsChanged', (accounts) => {
      callback.accountChanged(accounts[0])
    });
  }

  /* window.ethereum.on('chainChanged', (chainId) => {
    window.location.reload();
  }); */
}

const getAccount = () => {
  const web3 = getWeb3();
  return web3.eth.getAccounts().then((accounts) => accounts[0]);
}

const connectMetamask = () => {
  return window.ethereum
    .request({ method: 'eth_requestAccounts' })
    .then((accounts) => {
      return accounts[0];
    })
    .catch((err) => {
      console.error(err);
    });
}

export { connectWeb3Onload, connectWeb3, subscribeMetamask, connectMetamask, getAccount };
