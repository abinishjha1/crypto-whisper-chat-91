
import { useState, useEffect, useRef } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { VoiceInput } from '@/components/VoiceInput';
import { Portfolio } from '@/components/Portfolio';
import { CryptoChart } from '@/components/CryptoChart';
import { useCryptoAPI } from '@/hooks/useCryptoAPI';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { MessageCircle, TrendingUp } from 'lucide-react';

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  data?: any;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your crypto assistant 🚀 Ask me about prices, trends, or manage your portfolio. You can type or use voice commands!",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const { fetchCryptoPrice, fetchTrendingCoins, fetchCryptoHistory } = useCryptoAPI();
  const { portfolio, addHolding, getPortfolioValue } = usePortfolio();
  const { speak } = useSpeechSynthesis();

  const addMessage = (type: 'user' | 'bot', content: string, data?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      data
    };
    setMessages(prev => [...prev, newMessage]);
    
    if (type === 'bot') {
      speak(content);
    }
  };

  const processMessage = async (message: string) => {
    setIsThinking(true);
    const lowerMessage = message.toLowerCase();

    try {
      if (lowerMessage.includes('price') && (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc'))) {
        const data = await fetchCryptoPrice('bitcoin');
        if (data) {
          const response = `Bitcoin (BTC) is trading at $${data.current_price.toLocaleString()} with a 24h change of ${data.price_change_percentage_24h > 0 ? '+' : ''}${data.price_change_percentage_24h.toFixed(2)}%`;
          addMessage('bot', response, data);
        }
      } else if (lowerMessage.includes('price') && (lowerMessage.includes('ethereum') || lowerMessage.includes('eth'))) {
        const data = await fetchCryptoPrice('ethereum');
        if (data) {
          const response = `Ethereum (ETH) is trading at $${data.current_price.toLocaleString()} with a 24h change of ${data.price_change_percentage_24h > 0 ? '+' : ''}${data.price_change_percentage_24h.toFixed(2)}%`;
          addMessage('bot', response, data);
        }
      } else if (lowerMessage.includes('trending') || lowerMessage.includes('top')) {
        const data = await fetchTrendingCoins();
        if (data && data.length > 0) {
          const trendingList = data.slice(0, 5).map((coin: any) => 
            `${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price.toLocaleString()}`
          ).join('\n');
          addMessage('bot', `Here are the top trending cryptocurrencies:\n\n${trendingList}`, data);
        }
      } else if (lowerMessage.includes('chart') && (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc'))) {
        const data = await fetchCryptoHistory('bitcoin');
        if (data) {
          setChartData({ coin: 'Bitcoin', data });
          setShowChart(true);
          addMessage('bot', 'Here\'s the Bitcoin price chart for the last 7 days!');
        }
      } else if (lowerMessage.includes('chart') && (lowerMessage.includes('ethereum') || lowerMessage.includes('eth'))) {
        const data = await fetchCryptoHistory('ethereum');
        if (data) {
          setChartData({ coin: 'Ethereum', data });
          setShowChart(true);
          addMessage('bot', 'Here\'s the Ethereum price chart for the last 7 days!');
        }
      } else if (lowerMessage.includes('portfolio')) {
        const totalValue = await getPortfolioValue();
        if (portfolio.length === 0) {
          addMessage('bot', 'Your portfolio is empty. Try saying "I have 1 BTC" or "I have 2 ETH" to add holdings!');
        } else {
          addMessage('bot', `Your portfolio is worth $${totalValue.toLocaleString()}! You can see the breakdown below.`);
        }
      } else if (lowerMessage.includes('i have') || lowerMessage.includes('add')) {
        const regex = /(\d*\.?\d+)\s*(btc|bitcoin|eth|ethereum)/i;
        const match = message.match(regex);
        if (match) {
          const amount = parseFloat(match[1]);
          const crypto = match[2].toLowerCase();
          const coinId = crypto.includes('btc') || crypto.includes('bitcoin') ? 'bitcoin' : 'ethereum';
          
          await addHolding(coinId, amount);
          const totalValue = await getPortfolioValue();
          addMessage('bot', `Added ${amount} ${crypto.toUpperCase()} to your portfolio! Your total portfolio value is now $${totalValue.toLocaleString()}.`);
        } else {
          addMessage('bot', 'I didn\'t understand the format. Try saying "I have 1.5 BTC" or "I have 2 ETH".');
        }
      } else {
        addMessage('bot', 'I can help you with crypto prices, trending coins, portfolio tracking, and price charts. Try asking: "What\'s Bitcoin\'s price?", "Show trending cryptos", "I have 1 BTC", or "Show Bitcoin chart".');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('bot', 'Sorry, I encountered an error while fetching data. Please try again in a moment.');
    }

    setIsThinking(false);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addMessage('user', inputValue);
      processMessage(inputValue);
      setInputValue('');
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setInputValue(transcript);
    addMessage('user', transcript);
    processMessage(transcript);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Crypto Assistant</h1>
              <p className="text-sm text-gray-300">Your AI-powered crypto companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Live Data</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full gap-6 p-6">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatInterface 
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
          />
          
          <VoiceInput 
            onVoiceInput={handleVoiceInput}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-6 hidden lg:block">
          <Portfolio portfolio={portfolio} />
        </div>
      </div>

      {/* Chart Modal */}
      {showChart && chartData && (
        <CryptoChart
          data={chartData}
          onClose={() => setShowChart(false)}
        />
      )}
    </div>
  );
};

export default Index;
