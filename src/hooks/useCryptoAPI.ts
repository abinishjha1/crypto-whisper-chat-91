
import { useState } from 'react';

const COINCAP_API_BASE = 'https://api.coincap.io/v2';

export const useCryptoAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapCoinId = (coinId: string) => {
    const coinMap: { [key: string]: string } = {
      'bitcoin': 'bitcoin',
      'ethereum': 'ethereum',
      'btc': 'bitcoin',
      'eth': 'ethereum'
    };
    return coinMap[coinId.toLowerCase()] || coinId.toLowerCase();
  };

  const fetchCryptoPrice = async (coinId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const mappedId = mapCoinId(coinId);
      const response = await fetch(`${COINCAP_API_BASE}/assets/${mappedId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto price');
      }
      
      const result = await response.json();
      const coinData = result.data;
      
      if (!coinData) {
        throw new Error('Coin not found');
      }
      
      return {
        id: coinId,
        current_price: parseFloat(coinData.priceUsd),
        price_change_percentage_24h: parseFloat(coinData.changePercent24Hr),
        market_cap: parseFloat(coinData.marketCapUsd)
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
      const response = await fetch(`${COINCAP_API_BASE}/assets?limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending coins');
      }
      
      const result = await response.json();
      return result.data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        current_price: parseFloat(coin.priceUsd),
        price_change_percentage_24h: parseFloat(coin.changePercent24Hr),
        market_cap: parseFloat(coin.marketCapUsd)
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

  const fetchCryptoHistory = async (coinId: string, days: number = 7) => {
    setLoading(true);
    setError(null);
    
    try {
      const mappedId = mapCoinId(coinId);
      const interval = 'd1'; // daily intervals
      const end = Date.now();
      const start = end - (days * 24 * 60 * 60 * 1000);
      
      const response = await fetch(
        `${COINCAP_API_BASE}/assets/${mappedId}/history?interval=${interval}&start=${start}&end=${end}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto history');
      }
      
      const result = await response.json();
      // Convert to format expected by chart: [timestamp, price]
      return result.data.map((item: any) => [
        item.time,
        parseFloat(item.priceUsd)
      ]);
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
