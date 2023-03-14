import cryptoDB from '@coinspace/crypto-db';
import coingecko from './coingecko.js';
import db from './db.js';

const COLLECTION = 'market';

const queue = new Map();

const DAYS_MAP ={
  '1d': 1,
  '7d': 7,
  '1m': 30,
  '3m': 90,
  '1y': 365,
  all: 'max',
};
const EXPIRE_MAP = {
  '1d': 10 * 60 * 1000,
  '7d': 60 * 60 * 1000,
  '1m': 2 * 60 * 60 * 1000,
  '3m': 2 * 60 * 60 * 1000,
  '1y': 12 * 60 * 60 * 1000,
  all: 12 * 60 * 60 * 1000,
};

async function _getMarketData(crypto, currency, interval) {
  const id = `${crypto.coingecko.id}-${currency}-${interval}`;
  const cache = await db.collection(COLLECTION)
    .findOne({
      _id: id,
    });
  if (cache) {
    return {
      prices: cache.prices,
    };
  }
  const { data } = await coingecko.get(`/coins/${crypto.coingecko.id}/market_chart`, {
    params: {
      vs_currency: currency,
      days: DAYS_MAP[interval],
    },
  });
  if (!data?.prices) {
    return {};
  }
  await db.collection(COLLECTION)
    .insertOne({
      _id: id,
      prices: data.prices,
      expireAt: new Date(Date.now() + EXPIRE_MAP[interval]),
    });
  return {
    prices: data.prices,
  };
}

async function getMarketData(cryptoId, currency, interval) {
  const crypto = cryptoDB.find((item) => item._id === cryptoId);
  if (!crypto || !crypto.coingecko?.id) {
    return {};
  }
  const id = `${crypto.coingecko.id}-${currency}-${interval}`;
  if (!queue.has(id)) {
    queue.set(id, _getMarketData(crypto, currency, interval));
    queue.get(id).then(() => queue.delete(id), () => queue.delete(id));
  }
  return queue.get(id);
}

export default {
  getMarketData,
};
