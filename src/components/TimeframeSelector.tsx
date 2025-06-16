
import React from 'react';
import { Button } from '@/components/ui/button';

interface TimeframeSelectorProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onTimeframeChange
}) => {
  const timeframes = [
    { value: '1', label: '1D' },
    { value: '3', label: '3D' },
    { value: '7', label: '7D' },
    { value: '30', label: '1M' },
    { value: '365', label: '1Y' }
  ];

  return (
    <div className="flex gap-2 mb-4">
      {timeframes.map((timeframe) => (
        <Button
          key={timeframe.value}
          onClick={() => onTimeframeChange(timeframe.value)}
          variant={selectedTimeframe === timeframe.value ? "default" : "outline"}
          className={`px-3 py-1 text-sm ${
            selectedTimeframe === timeframe.value
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          }`}
        >
          {timeframe.label}
        </Button>
      ))}
    </div>
  );
};
