import { useState } from 'react';

const CRYPTOCOMPARE_API_BASE = 'https://min-api.cryptocompare.com/data';

export const useCryptoAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapCoinSymbol = (coinId: string) => {
    const coinMap: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'litecoin': 'LTC',
      'cardano': 'ADA',
      'polkadot': 'DOT',
      'chainlink': 'LINK',
      'ripple': 'XRP',
      'solana': 'SOL',
      'dogecoin': 'DOGE',
      'shiba-inu': 'SHIB',
      'btc': 'BTC',
      'eth': 'ETH',
      'ltc': 'LTC',
      'ada': 'ADA',
      'dot': 'DOT',
      'link': 'LINK',
      'xrp': 'XRP',
      'sol': 'SOL',
      'doge': 'DOGE',
      'shib': 'SHIB'
    };
    return coinMap[coinId.toLowerCase()] || coinId.toUpperCase();
  };

  const fetchCryptoPrice = async (coinId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const symbol = mapCoinSymbol(coinId);
      console.log(`Fetching price for ${coinId} (${symbol})`);
      
      const response = await fetch(`${CRYPTOCOMPARE_API_BASE}/pricemultifull?fsyms=${symbol}&tsyms=USD`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto price');
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      const coinData = result.RAW?.[symbol]?.USD;
      
      if (!coinData) {
        throw new Error('Coin not found');
      }
      
      return {
        id: coinId,
        current_price: coinData.PRICE,
        price_change_percentage_24h: coinData.CHANGEPCT24HOUR,
        market_cap: coinData.MKTCAP
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
      const response = await fetch(`${CRYPTOCOMPARE_API_BASE}/top/mktcapfull?limit=10&tsym=USD`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending coins');
      }
      
      const result = await response.json();
      return result.Data.map((coin: any) => ({
        id: coin.CoinInfo.Name.toLowerCase(),
        name: coin.CoinInfo.FullName,
        symbol: coin.CoinInfo.Name,
        current_price: coin.RAW?.USD?.PRICE || 0,
        price_change_percentage_24h: coin.RAW?.USD?.CHANGEPCT24HOUR || 0,
        market_cap: coin.RAW?.USD?.MKTCAP || 0
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
      const symbol = mapCoinSymbol(coinId);
      const response = await fetch(
        `${CRYPTOCOMPARE_API_BASE}/v2/histoday?fsym=${symbol}&tsym=USD&limit=${days}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto history');
      }
      
      const result = await response.json();
      // Convert to format expected by chart: [timestamp, price]
      return result.Data.Data.map((item: any) => [
        item.time * 1000, // Convert to milliseconds
        item.close
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
