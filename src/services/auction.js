import { connectWeb3 } from "./web3";
import AuctionContract from "../contracts/Auction.json";
import { resultToObject } from '../helpers/parse';

let contract = null;

const getContract = async () => {
  if (contract) {
    return contract;
  }

  const web3 = await connectWeb3();
  const networkId = await web3.eth.net.getId();

  const deployedNetwork = AuctionContract.networks[networkId];
  return new web3.eth.Contract(
    AuctionContract.abi,
    deployedNetwork && deployedNetwork.address,
  );
}

const parseAuction = (response) => {
  return resultToObject(response, 'openTime', 'closeTime', 'startPrice', 'product');
}

const parseBid = (response) => {
  return resultToObject(response, 'bidder', 'price');
}

export const getAuctions = async (productIds, sender) => {
  const auctionContract = await getContract();
  const auctionStatePromises = productIds.map((id) =>
    auctionContract.methods.hasAuction(id).call({ from: sender })
      .then((has) => has ? id : null)
  );
  const auctionStates = await Promise.all(auctionStatePromises);
  const auctions = auctionStates.filter(state => !!state).map((state) =>
    auctionContract.methods.getAuction(state).call({ from: sender })
      .then((data) => {
        const auction = parseAuction(data);
        auction.openTime = +auction.openTime;
        auction.closeTime = +auction.closeTime;
        return auctionContract.methods.isOpen(state).call({ from: sender })
          .then((open) => {
            auction.opened = open;
            return auctionContract.methods.hasClosed(state).call({ from: sender })
              .then((close) => {
                auction.closed = close;
                return auctionContract.methods.hasBidded(state).call({ from: sender })
                  .then((bid) => {
                    auction.bidded = bid;
                    return auction;
                  });
              });
          });
      })
  );
  return Promise.all(auctions);
}

export const startAuction = async (open, close, productId, price, sender) => {
  const auctionContract = await getContract();
  return auctionContract.methods.start(open, close, productId, price).send({ from: sender });
}

export const endAuction = async (productId, sender) => {
  const auctionContract = await getContract();
  return auctionContract.methods.end(productId).send({ from: sender });
}

export const bidAuction = async (productId, amount, sender) => {
  const auctionContract = await getContract();
  return auctionContract.methods.bid(productId).send({ from: sender, value: amount });
}

export const getBids = async (productId, sender) => {
  const auctionContract = await getContract();
  const count = await auctionContract.methods.getBidCount(productId).call({ from: sender });
  const bids = [];
  for (let i = 0; i < count; i++) {
    bids.push(auctionContract.methods.getBid(productId, i).call({ from: sender })
      .then(parseBid)
    );
  }
  return Promise.all(bids);
}

export const subscribeEvent = async (eventname, callback, filter) => {
  const auctionContract = await getContract();
  return auctionContract.events[eventname]({ filter })
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
