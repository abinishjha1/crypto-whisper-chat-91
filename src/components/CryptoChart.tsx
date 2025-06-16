
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeframeSelector } from './TimeframeSelector';
import { useCryptoAPI } from '@/hooks/useCryptoAPI';

interface CryptoChartProps {
  data: {
    coin: string;
    coinId: string;
    data: Array<[number, number]>;
  };
  onClose: () => void;
}

export const CryptoChart: React.FC<CryptoChartProps> = ({ data: initialData, onClose }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7');
  const [chartData, setChartData] = useState(initialData.data);
  const [loading, setLoading] = useState(false);
  const { fetchCryptoHistory } = useCryptoAPI();

  const formatDateByTimeframe = (timestamp: number, timeframe: string) => {
    const date = new Date(timestamp);
    
    if (timeframe === '1') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '3') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '365') {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const processedChartData = chartData.map(([timestamp, price]) => ({
    date: formatDateByTimeframe(timestamp, selectedTimeframe),
    price: price,
    timestamp: timestamp
  }));

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const handleTimeframeChange = async (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    setLoading(true);
    
    try {
      const newData = await fetchCryptoHistory(initialData.coinId, timeframe);
      if (newData) {
        setChartData(newData);
      }
    } catch (error) {
      console.error('Error fetching new timeframe data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = processedChartData[processedChartData.length - 1]?.price || 0;
  const firstPrice = processedChartData[0]?.price || 0;
  const priceChange = ((currentPrice - firstPrice) / firstPrice) * 100;

  const getTimeframeLabel = (timeframe: string) => {
    const labels: { [key: string]: string } = {
      '1': 'Last 24 hours',
      '3': 'Last 3 days',
      '7': 'Last 7 days',
      '30': 'Last 30 days',
      '365': 'Last year'
    };
    return labels[timeframe] || 'Last 7 days';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black/80 backdrop-blur-lg rounded-2xl border border-white/20 p-6 max-w-5xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{initialData.coin} Price Chart</h2>
              <p className="text-sm text-gray-400">{getTimeframeLabel(selectedTimeframe)}</p>
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

        <TimeframeSelector 
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={handleTimeframeChange}
        />

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4">
            <span className="text-gray-400 text-sm">Current Price</span>
            <div className="text-2xl font-bold text-white">{formatPrice(currentPrice)}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <span className="text-gray-400 text-sm">{getTimeframeLabel(selectedTimeframe)} Change</span>
            <div className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="h-96 w-full relative">
          {loading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <div className="text-white">Loading chart data...</div>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                interval="preserveStartEnd"
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
