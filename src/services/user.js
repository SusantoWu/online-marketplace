import { connectWeb3 } from "./web3";
import UserContract from "../contracts/User.json";
import role from "../role";

let contract = null;

const getContract = async () => {
  if (contract) {
    return contract;
  }

  const web3 = await connectWeb3();
  const networkId = await web3.eth.net.getId();

  const deployedNetwork = UserContract.networks[networkId];
  return new web3.eth.Contract(
    UserContract.abi,
    deployedNetwork && deployedNetwork.address,
  );
}

const getAccounts = async (roleFnName, sender) => {
  const userContract = await getContract();
  const role = await getRoleConstant(roleFnName);
  const count = await userContract.methods.getRoleMemberCount(role).call();
  const accounts = [];
  for (let i = 0; i < count; i++) {
    accounts.push(userContract.methods.getRoleMember(role, i).call({ from: sender }));
  }
  return Promise.all(accounts);
}

export const getRoleConstant = async (roleFnName) => {
  const userContract = await getContract();
  return userContract.methods[roleFnName]().call();;
}

export const getRole = async (account) => {
  const userContract = await getContract();
  return userContract.methods.getRole(account).call();;
}

export const getAdmins = async (sender) => {
  return getAccounts(role.admin, sender);
}

export const addAdmin = async (account, sender) => {
  const userContract = await getContract();
  return userContract.methods.addAdmin(account).send({ from: sender });
}

export const deleteAdmin = async (account, sender) => {
  const userContract = await getContract();
  return userContract.methods.revokeAdmin(account).send({ from: sender });
}

export const getSellers = async (sender) => {
  return getAccounts(role.seller, sender);
}

export const addSeller = async (account, sender) => {
  const userContract = await getContract();
  return userContract.methods.addSeller(account).send({ from: sender });
}

export const deleteSeller = async (account, sender) => {
  const userContract = await getContract();
  return userContract.methods.revokeSeller(account).send({ from: sender });
}

export const subscribeEvent = async (eventname, callback, roleFnName) => {
  const userContract = await getContract();
  const role = await getRoleConstant(roleFnName);
  return userContract.events[eventname]({ filter: { role } })
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
