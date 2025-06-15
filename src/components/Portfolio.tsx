
import React from 'react';
import { TrendingUp, Wallet, Bitcoin } from 'lucide-react';

interface PortfolioItem {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  currentPrice: number;
  value: number;
}

interface PortfolioProps {
  portfolio: PortfolioItem[];
}

export const Portfolio: React.FC<PortfolioProps> = ({ portfolio }) => {
  const totalValue = portfolio.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white">Portfolio</h2>
      </div>

      {portfolio.length === 0 ? (
        <div className="text-center py-8">
          <Bitcoin className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 text-sm">
            No holdings yet. Say "I have 1 BTC" to add crypto to your portfolio!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-600/10 rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Total Value</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              ${totalValue.toLocaleString()}
            </div>
          </div>

          <div className="space-y-3">
            {portfolio.map((item) => (
              <div key={item.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {item.symbol.charAt(0)}
                    </div>
                    <span className="text-white font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                    {item.symbol.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Amount</span>
                    <div className="text-white font-medium">{item.amount}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Value</span>
                    <div className="text-white font-medium">${item.value.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
