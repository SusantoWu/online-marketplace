import { connectWeb3 } from "./web3";
import PaymentContract from "../contracts/Payment.json";

let contract = null;

const getContract = async () => {
  if (contract) {
    return contract;
  }

  const web3 = await connectWeb3();
  const networkId = await web3.eth.net.getId();

  const deployedNetwork = PaymentContract.networks[networkId];
  return new web3.eth.Contract(
    PaymentContract.abi,
    deployedNetwork && deployedNetwork.address,
  );
}

export const getPayments = async (account) => {
  const paymentContract = await getContract();
  return paymentContract.methods.payments(account).call();
}

export const withdraw = async (sender, callback) => {
  const paymentContract = await getContract();
  return paymentContract.methods.withdraw().send({ from: sender })
    .on('receipt', (receipt) => {
      if (callback.receipt) {
        callback.receipt(receipt);
      }
    });
}

/* Note: unable to listen to internal contract events, using above method. */
/* export const subscribeEvent = async (callback, filter) => {
  const paymentContract = await getContract();
  return paymentContract.events.allEvents({ filter })
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
} */
