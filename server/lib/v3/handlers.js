import createError from 'http-errors';
import cryptos from '../cryptos.js';

export async function qwe(req, res) {
  return res.status(200).send('ok');
}

export async function getCryptos(req, res) {
  const list = await cryptos.getAll();
  res.status(200).send(list);
}

export async function getTicker(req, res) {
  const ticker = await cryptos.getTicker(req.query.crypto);
  if (!ticker) {
    throw createError(404, 'Crypto not found');
  }
  res.status(200).send(ticker);
}

export async function getTickers(req, res) {
  const tickers = await cryptos.getTickers(req.query.crypto);
  res.status(200).send(tickers);
}
