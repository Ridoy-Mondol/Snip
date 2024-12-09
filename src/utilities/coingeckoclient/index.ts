import axios from "axios";

const BASE_URL = "https://api.coingecko.com/api/v3/";
const cacheMap = new Map();
const cacheClearTimeout = 5 * 60 * 1000;

const cacheKey = (path: string, config: object) =>
  JSON.stringify([path, config]);
const cacheHas = (path: string, config: object) =>
  cacheMap.has(cacheKey(path, config));
const cacheGet = (path: string, config: object) =>
  cacheMap.get(cacheKey(path, config));
const cacheSet = (path: string, config: object, data: any) =>
  cacheMap.set(cacheKey(path, config), data);

const cacheRegisterClearTimer = () =>
  setInterval(() => cacheMap.clear(), cacheClearTimeout);

const get = async (
  path: string,
  config: object = {},
  consistency: Function | null = null,
  cache: boolean = true,
) => {
  if (cache && cacheHas(path, config)) {
    return Promise.resolve(cacheGet(path, config));
  }

  const client = axios.create({ baseURL: BASE_URL });

  try {
    const res = await client.get(path, config);
    let data = res.data;

    if (consistency) {
      if (Array.isArray(consistency)) data = Array.isArray(data) ? data : [];
      else if (typeof consistency === "function") data = consistency(data);
      else if (typeof consistency === "object")
        data = typeof data === "object" ? data : {};
    }

    if (cache && data) cacheSet(path, config, data);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const marketChartDataConsistency = (data: any) => {
  if (
    !data ||
    !Array.isArray(data.market_caps) ||
    !Array.isArray(data.prices) ||
    !Array.isArray(data.total_volumes) ||
    data.market_caps.length !== data.prices.length ||
    data.market_caps.length !== data.total_volumes.length
  ) {
    return Promise.reject(new Error());
  }
  return data;
};

const validateUrls = (list: string[]) => {
  return (list || []).filter((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
};

export const CoinGeckoClient = {
  global: (cache = true) =>
    get("global", {}, (data: any) => data.data || {}, cache),
  coinsMarkets: (params: object, cache = true) =>
    get("coins/markets", { params }, null, cache),
  coin: (id: string, params: object, cache = true) =>
    get(
      `coins/${id}`,
      { params },
      (currency: any) => {
        currency.symbol = currency.symbol.toLowerCase();
        currency.categories = [...new Set(currency.categories)];
        currency.category = currency.categories[0];
        currency.platforms = currency.platforms || {};
        currency.platformList = Object.entries(currency.platforms).map(
          ([name, address]) => [
            name.charAt(0).toUpperCase() + name.slice(1),
            address,
          ],
        );
        const links = currency.links || {};
        currency.websiteUrl = validateUrls(links.homepage)[0] || "";
        currency.explorerUrls = validateUrls(links.blockchain_site);
        currency.announcementUrls = validateUrls(links.announcement_url);
        currency.forumUrls = validateUrls(links.official_forum_url);
        currency.chatUrls = validateUrls(links.chat_url);
        currency.redditUrl = validateUrls([links.subreddit_url])[0] || "";
        currency.twitterUrl =
          validateUrls([
            `https://twitter.com/${links.twitter_screen_name}`,
          ])[0] || "";
        currency.facebookUrl =
          validateUrls([
            `https://www.facebook.com/${links.facebook_username}`,
          ])[0] || "";
        currency.bitcointalkId = links.bitcointalk_thread_identifier || null;
        currency.bitcointalkUrl = currency.bitcointalkId
          ? `https://bitcointalk.org/index.php?topic=${currency.bitcointalkId}`
          : "";
        links.repos_url = links.repos_url || {};
        currency.githubUrls = validateUrls(links.repos_url.github);
        currency.bitbucketUrls = validateUrls(links.repos_url.bitbucket);
        currency.url = currency.websiteUrl || currency.customLinkUrl;
        return currency;
      },
      cache,
    ),
  coinMarketChart: (id: string, params: object, cache = true) =>
    get(
      `coins/${id}/market_chart`,
      { params },
      marketChartDataConsistency,
      cache,
    ),
  coinMarketChartRange: (id: string, params: object, cache = true) =>
    get(
      `coins/${id}/market_chart/range`,
      { params },
      marketChartDataConsistency,
      cache,
    ),
  coinTickers: (id: string, params: object, cache = true) =>
    get(
      `coins/${id}/tickers`,
      { params },
      (data: any) => data.tickers || [],
      cache,
    ),
  exchanges: (params: object, cache = true) =>
    get("exchanges", { params }, null, cache),
  exchange: (id: string, params: object, cache = true) =>
    get(
      `exchanges/${id}`,
      { params },
      (exchange: any) => {
        exchange.websiteUrl = validateUrls([exchange.url])[0] || "";
        exchange.twitterUrl =
          validateUrls([`https://twitter.com/${exchange.twitter_handle}`])[0] ||
          "";
        exchange.facebookUrl =
          validateUrls([
            `https://www.facebook.com/${exchange.facebook_url}`,
          ])[0] || "";
        exchange.redditUrl =
          validateUrls([`https://www.reddit.com/${exchange.reddit_url}`])[0] ||
          "";
        exchange.telegramUrl =
          validateUrls([`https://t.me/${exchange.telegram_url}`])[0] || "";
        exchange.url = exchange.websiteUrl || exchange.customLinkUrl;
        return exchange;
      },
      cache,
    ),
  exchangeTickers: (id: string, params: object, cache = true) =>
    get(
      `exchanges/${id}/tickers`,
      { params },
      (data: any) => data.tickers || [],
      cache,
    ),
  exchangeVolumeChart: (id: string, params: object, cache = true) =>
    get(`exchanges/${id}/volume_chart`, { params }, null, cache),
  search: (cache = true) =>
    get(
      "search/",
      {},
      (search: any) => ({
        categories: search.categories || [],
        coins: search.coins || [],
        exchanges: search.exchanges || [],
        icos: search.icos || [],
      }),
      cache,
    ),
  searchTrending: (cache = true) =>
    get(
      "search/trending",
      {},
      (trending: any) => {
        trending.exchanges = trending.exchanges || [];
        trending.coins = (trending.coins || []).map((item: any) => item.item);
        return trending;
      },
      cache,
    ),
  financePlatforms: (params: object, cache = true) =>
    get(
      "finance_platforms",
      { params },
      (platforms: any) =>
        (platforms || []).map((platform: any) => {
          platform.websiteUrl = validateUrls([platform.website_url])[0] || "";
          platform.url = platform.websiteUrl || platform.customLinkUrl;
          platform.color = platform.centralized ? "orange" : "green";
          platform.catLabel = platform.centralized ? "CeFi" : "DeFi";
          return platform;
        }),
      cache,
    ),
  financeProducts: (params: object, cache = true) =>
    get("finance_products", { params }, null, cache),
  derivatives: (params: object, cache = true) =>
    get("derivatives", { params }, null, cache),
};
