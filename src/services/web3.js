import Web3 from "web3";

const getWeb3 = async () => {
  // Modern dapp browsers...
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.enable();
      // Acccounts now exposed
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

export { connectWeb3Onload, connectWeb3 };
