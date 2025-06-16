
import { useState } from 'react';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export const useCryptoAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapCoinId = (coinId: string) => {
    const coinMap: { [key: string]: string } = {
      'bitcoin': 'bitcoin',
      'btc': 'bitcoin',
      'ethereum': 'ethereum',
      'eth': 'ethereum',
      'litecoin': 'litecoin',
      'ltc': 'litecoin',
      'cardano': 'cardano',
      'ada': 'cardano',
      'polkadot': 'polkadot',
      'dot': 'polkadot',
      'chainlink': 'chainlink',
      'link': 'chainlink',
      'ripple': 'ripple',
      'xrp': 'ripple',
      'solana': 'solana',
      'sol': 'solana',
      'dogecoin': 'dogecoin',
      'doge': 'dogecoin',
      'shiba-inu': 'shiba-inu',
      'shib': 'shiba-inu'
    };
    return coinMap[coinId.toLowerCase()] || coinId.toLowerCase();
  };

  const fetchCryptoPrice = async (coinId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const mappedId = mapCoinId(coinId);
      console.log(`Fetching price for ${coinId} (${mappedId})`);
      
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=${mappedId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto price');
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      const coinData = result[mappedId];
      
      if (!coinData) {
        throw new Error('Coin not found');
      }
      
      return {
        id: coinId,
        current_price: coinData.usd,
        price_change_percentage_24h: coinData.usd_24h_change,
        market_cap: coinData.usd_market_cap
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching crypto price:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingCoins = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending coins');
      }
      
      const result = await response.json();
      return result.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching trending coins:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchCryptoHistory = async (coinId: string, timeframe: string = '7') => {
    setLoading(true);
    setError(null);
    
    try {
      const mappedId = mapCoinId(coinId);
      
      // Map timeframes to CoinGecko API parameters
      const timeframeMap: { [key: string]: { days: string, interval?: string } } = {
        '1': { days: '1', interval: 'hourly' },
        '3': { days: '3', interval: 'hourly' },
        '7': { days: '7' },
        '30': { days: '30' },
        '365': { days: '365' }
      };
      
      const params = timeframeMap[timeframe] || { days: '7' };
      let url = `${COINGECKO_API_BASE}/coins/${mappedId}/market_chart?vs_currency=usd&days=${params.days}`;
      
      if (params.interval) {
        url += `&interval=${params.interval}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto history');
      }
      
      const result = await response.json();
      // CoinGecko returns prices as [timestamp, price] arrays
      return result.prices;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching crypto history:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchCryptoPrice,
    fetchTrendingCoins,
    fetchCryptoHistory,
    loading,
    error
  };
};
