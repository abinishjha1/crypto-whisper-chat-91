
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CryptoChartProps {
  data: {
    coin: string;
    data: Array<[number, number]>;
  };
  onClose: () => void;
}

export const CryptoChart: React.FC<CryptoChartProps> = ({ data, onClose }) => {
  const chartData = data.data.map(([timestamp, price]) => ({
    date: new Date(timestamp).toLocaleDateString(),
    price: price,
    timestamp: timestamp
  }));

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const currentPrice = chartData[chartData.length - 1]?.price || 0;
  const firstPrice = chartData[0]?.price || 0;
  const priceChange = ((currentPrice - firstPrice) / firstPrice) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black/80 backdrop-blur-lg rounded-2xl border border-white/20 p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{data.coin} Price Chart</h2>
              <p className="text-sm text-gray-400">Last 7 days</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4">
            <span className="text-gray-400 text-sm">Current Price</span>
            <div className="text-2xl font-bold text-white">{formatPrice(currentPrice)}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <span className="text-gray-400 text-sm">7-Day Change</span>
            <div className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={formatPrice}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => [formatPrice(value), 'Price']}
                labelStyle={{ color: '#1F2937' }}
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="url(#gradient)" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
