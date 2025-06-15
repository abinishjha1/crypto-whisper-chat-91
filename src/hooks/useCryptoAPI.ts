
import { useState } from 'react';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export const useCryptoAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCryptoPrice = async (coinId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto price');
      }
      
      const data = await response.json();
      const coinData = data[coinId];
      
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
      const response = await fetch(
        `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending coins');
      }
      
      const data = await response.json();
      return data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
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

  const fetchCryptoHistory = async (coinId: string, days: number = 7) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto history');
      }
      
      const data = await response.json();
      return data.prices; // Array of [timestamp, price]
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
