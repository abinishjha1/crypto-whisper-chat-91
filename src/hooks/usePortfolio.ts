import { useState, useEffect } from 'react';
import { useCryptoAPI } from './useCryptoAPI';

interface PortfolioItem {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  currentPrice: number;
  value: number;
}

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const { fetchCryptoPrice } = useCryptoAPI();

  useEffect(() => {
    const savedPortfolio = localStorage.getItem('cryptoPortfolio');
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
  }, []);

  const savePortfolio = (newPortfolio: PortfolioItem[]) => {
    setPortfolio(newPortfolio);
    localStorage.setItem('cryptoPortfolio', JSON.stringify(newPortfolio));
  };

  const getCoinName = (coinId: string) => {
    const coinNames: { [key: string]: { name: string; symbol: string } } = {
      bitcoin: { name: 'Bitcoin', symbol: 'BTC' },
      ethereum: { name: 'Ethereum', symbol: 'ETH' },
      litecoin: { name: 'Litecoin', symbol: 'LTC' },
      cardano: { name: 'Cardano', symbol: 'ADA' },
      polkadot: { name: 'Polkadot', symbol: 'DOT' },
      chainlink: { name: 'Chainlink', symbol: 'LINK' },
      ripple: { name: 'Ripple', symbol: 'XRP' },
      solana: { name: 'Solana', symbol: 'SOL' },
      dogecoin: { name: 'Dogecoin', symbol: 'DOGE' },
      'shiba-inu': { name: 'Shiba Inu', symbol: 'SHIB' }
    };
    return coinNames[coinId] || { name: coinId, symbol: coinId.toUpperCase() };
  };

  const addHolding = async (coinId: string, amount: number) => {
    try {
      const priceData = await fetchCryptoPrice(coinId);
      if (!priceData) {
        throw new Error('Failed to fetch current price');
      }

      const coinInfo = getCoinName(coinId);
      const existingIndex = portfolio.findIndex(item => item.id === coinId);
      
      let newPortfolio;
      if (existingIndex >= 0) {
        // Update existing holding
        newPortfolio = [...portfolio];
        newPortfolio[existingIndex] = {
          ...newPortfolio[existingIndex],
          amount: newPortfolio[existingIndex].amount + amount,
          currentPrice: priceData.current_price,
          value: (newPortfolio[existingIndex].amount + amount) * priceData.current_price
        };
      } else {
        // Add new holding
        const newItem: PortfolioItem = {
          id: coinId,
          name: coinInfo.name,
          symbol: coinInfo.symbol,
          amount,
          currentPrice: priceData.current_price,
          value: amount * priceData.current_price
        };
        newPortfolio = [...portfolio, newItem];
      }
      
      savePortfolio(newPortfolio);
    } catch (error) {
      console.error('Error adding holding:', error);
      throw error;
    }
  };

  const updatePrices = async () => {
    if (portfolio.length === 0) return;

    try {
      const updatedPortfolio = await Promise.all(
        portfolio.map(async (item) => {
          const priceData = await fetchCryptoPrice(item.id);
          if (priceData) {
            return {
              ...item,
              currentPrice: priceData.current_price,
              value: item.amount * priceData.current_price
            };
          }
          return item;
        })
      );
      
      savePortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  };

  const getPortfolioValue = async () => {
    await updatePrices();
    return portfolio.reduce((sum, item) => sum + item.value, 0);
  };

  const removeHolding = (coinId: string) => {
    const newPortfolio = portfolio.filter(item => item.id !== coinId);
    savePortfolio(newPortfolio);
  };

  return {
    portfolio,
    addHolding,
    removeHolding,
    updatePrices,
    getPortfolioValue
  };
};
