const axios = require('axios');

let tokenCache = { token: null, expires: 0 };

const getToken = async () => {
  if (tokenCache.token && Date.now() < tokenCache.expires) return tokenCache.token;

  const credentials = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString('base64');

  const res = await axios.post(
    'https://api.ebay.com/identity/v1/oauth2/token',
    'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    { headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  tokenCache = {
    token: res.data.access_token,
    expires: Date.now() + (res.data.expires_in - 60) * 1000,
  };
  return tokenCache.token;
};

// Build the best search query from AI fields, most specific to least
const buildQuery = (ai) => {
  const parts = [ai.brand, ai.year, ai.series, ai.make, ai.model].filter(Boolean);
  return parts.join(' ');
};

const searchPrices = async (ai) => {
  if (!process.env.EBAY_CLIENT_ID || !process.env.EBAY_CLIENT_SECRET) return null;

  const query = buildQuery(ai);
  if (!query) return null;

  const token = await getToken();

  const res = await axios.get('https://api.ebay.com/buy/browse/v1/item_summary/search', {
    headers: { Authorization: `Bearer ${token}` },
    params: { q: query, limit: 20, filter: 'buyingOptions:{FIXED_PRICE}' },
  });

  const prices = (res.data.itemSummaries || [])
    .map(i => parseFloat(i.price?.value))
    .filter(p => !isNaN(p) && p > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) return null;

  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

  return {
    low: prices[0],
    high: prices[prices.length - 1],
    avg: Math.round(avg * 100) / 100,
    count: prices.length,
    query,
  };
};

module.exports = { searchPrices };
