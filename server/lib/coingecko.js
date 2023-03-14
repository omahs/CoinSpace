import axios from 'axios';
import axiosRetry from 'axios-retry';
import rateLimit from 'axios-rate-limit';

const coingecko = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
  timeout: 30000,
});

axiosRetry(coingecko, {
  retries: 3,
  retryDelay: (retryCount, err) => {
    if (err?.response?.headers['retry-after']) {
      return err.response.headers['retry-after'] * 1000;
    }
    return 30 * 1000;
  },
  retryCondition: (err) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(err) || (err.response && err.response.status === 429);
  },
  shouldResetTimeout: true,
});

rateLimit(coingecko, {
  maxRequests: 15,
  // 2 min
  perMilliseconds: 2 * 60 * 1000,
});

export default coingecko;
