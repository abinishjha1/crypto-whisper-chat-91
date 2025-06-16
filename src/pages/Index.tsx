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

  // Helper function to convert written numbers to digits
  const parseWrittenNumber = (text: string): number => {
    const numberWords: { [key: string]: number } = {
      'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
      'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20
    };
    
    const lowerText = text.toLowerCase();
    for (const [word, num] of Object.entries(numberWords)) {
      if (lowerText.includes(word)) {
        return num;
      }
    }
    
    // Try to extract decimal numbers
    const numberMatch = text.match(/(\d*\.?\d+)/);
    return numberMatch ? parseFloat(numberMatch[1]) : 0;
  };

  // Enhanced crypto detection with more coins
  const detectCryptoCoin = (message: string): { id: string, name: string } | null => {
    const lowerMessage = message.toLowerCase();
    
    const cryptoMap: { [key: string]: { id: string, name: string } } = {
      'bitcoin': { id: 'bitcoin', name: 'Bitcoin' },
      'btc': { id: 'bitcoin', name: 'Bitcoin' },
      'ethereum': { id: 'ethereum', name: 'Ethereum' },
      'eth': { id: 'ethereum', name: 'Ethereum' },
      'litecoin': { id: 'litecoin', name: 'Litecoin' },
      'ltc': { id: 'litecoin', name: 'Litecoin' },
      'cardano': { id: 'cardano', name: 'Cardano' },
      'ada': { id: 'cardano', name: 'Cardano' },
      'polkadot': { id: 'polkadot', name: 'Polkadot' },
      'dot': { id: 'polkadot', name: 'Polkadot' },
      'chainlink': { id: 'chainlink', name: 'Chainlink' },
      'link': { id: 'chainlink', name: 'Chainlink' },
      'ripple': { id: 'ripple', name: 'Ripple' },
      'xrp': { id: 'ripple', name: 'Ripple' },
      'solana': { id: 'solana', name: 'Solana' },
      'sol': { id: 'solana', name: 'Solana' },
      'dogecoin': { id: 'dogecoin', name: 'Dogecoin' },
      'doge': { id: 'dogecoin', name: 'Dogecoin' },
      'shiba': { id: 'shiba-inu', name: 'Shiba Inu' },
      'shib': { id: 'shiba-inu', name: 'Shiba Inu' }
    };

    for (const [keyword, coin] of Object.entries(cryptoMap)) {
      if (lowerMessage.includes(keyword)) {
        return coin;
      }
    }
    
    return null;
  };

  const processMessage = async (message: string) => {
    setIsThinking(true);
    const lowerMessage = message.toLowerCase();

    try {
      // Check for price queries
      if (lowerMessage.includes('price') || lowerMessage.includes('trading') || lowerMessage.includes('worth')) {
        const coin = detectCryptoCoin(message);
        if (coin) {
          const data = await fetchCryptoPrice(coin.id);
          if (data) {
            const response = `${coin.name} is trading at $${data.current_price.toLocaleString()} with a 24h change of ${data.price_change_percentage_24h > 0 ? '+' : ''}${data.price_change_percentage_24h.toFixed(2)}%`;
            addMessage('bot', response, data);
          } else {
            addMessage('bot', `Sorry, I couldn't fetch the price for ${coin.name}. Please try again.`);
          }
        } else {
          addMessage('bot', 'Please specify which cryptocurrency you\'d like to know the price of. I support Bitcoin, Ethereum, Litecoin, Cardano, Polkadot, Chainlink, Ripple, Solana, Dogecoin, and Shiba Inu.');
        }
      }
      // Check for trending coins
      else if (lowerMessage.includes('trending') || lowerMessage.includes('top')) {
        const data = await fetchTrendingCoins();
        if (data && data.length > 0) {
          const trendingList = data.slice(0, 5).map((coin: any) => 
            `${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price.toLocaleString()}`
          ).join('\n');
          addMessage('bot', `Here are the top trending cryptocurrencies:\n\n${trendingList}`, data);
        }
      }
      // Check for chart requests
      else if (lowerMessage.includes('chart')) {
        const coin = detectCryptoCoin(message);
        if (coin) {
          const data = await fetchCryptoHistory(coin.id);
          if (data) {
            setChartData({ coin: coin.name, data });
            setShowChart(true);
            addMessage('bot', `Here's the ${coin.name} price chart for the last 7 days!`);
          } else {
            addMessage('bot', `Sorry, I couldn't fetch the chart data for ${coin.name}.`);
          }
        } else {
          addMessage('bot', 'Please specify which cryptocurrency chart you\'d like to see.');
        }
      }
      // Check for portfolio queries
      else if (lowerMessage.includes('portfolio')) {
        const totalValue = await getPortfolioValue();
        if (portfolio.length === 0) {
          addMessage('bot', 'Your portfolio is empty. Try saying "I have 1 BTC" or "I have 2 ETH" to add holdings!');
        } else {
          addMessage('bot', `Your portfolio is worth $${totalValue.toLocaleString()}! You can see the breakdown below.`);
        }
      }
      // Enhanced portfolio addition with better parsing
      else if (lowerMessage.includes('i have') || lowerMessage.includes('i own') || lowerMessage.includes('add')) {
        console.log('Processing portfolio command:', message);
        
        // Enhanced regex to capture written numbers and crypto symbols
        const patterns = [
          /(?:i have|i own|add)\s+(\d*\.?\d+|\w+)\s+(btc|bitcoin|eth|ethereum|ltc|litecoin|ada|cardano|dot|polkadot|link|chainlink|xrp|ripple|sol|solana|doge|dogecoin|shib|shiba)/i,
          /(\d*\.?\d+|\w+)\s+(btc|bitcoin|eth|ethereum|ltc|litecoin|ada|cardano|dot|polkadot|link|chainlink|xrp|ripple|sol|solana|doge|dogecoin|shib|shiba)/i
        ];
        
        let match = null;
        for (const pattern of patterns) {
          match = message.match(pattern);
          if (match) break;
        }
        
        if (match) {
          const amountStr = match[1];
          const cryptoStr = match[2].toLowerCase();
          
          // Parse amount (handle both numbers and written numbers)
          let amount = parseFloat(amountStr);
          if (isNaN(amount)) {
            amount = parseWrittenNumber(amountStr);
          }
          
          if (amount > 0) {
            const coin = detectCryptoCoin(cryptoStr);
            if (coin) {
              try {
                await addHolding(coin.id, amount);
                const totalValue = await getPortfolioValue();
                addMessage('bot', `Added ${amount} ${coin.name} to your portfolio! Your total portfolio value is now $${totalValue.toLocaleString()}.`);
              } catch (error) {
                addMessage('bot', `Sorry, I couldn't add ${coin.name} to your portfolio. Please try again.`);
              }
            } else {
              addMessage('bot', 'I didn\'t recognize that cryptocurrency. Please try with Bitcoin, Ethereum, Litecoin, Cardano, Polkadot, Chainlink, Ripple, Solana, Dogecoin, or Shiba Inu.');
            }
          } else {
            addMessage('bot', 'Please specify a valid amount. For example: "I have 1.5 BTC" or "I have five ethereum".');
          }
        } else {
          addMessage('bot', 'I didn\'t understand the format. Try saying "I have 1.5 BTC", "I have 2 ETH", or "I have five ethereum".');
        }
      }
      // Default response
      else {
        addMessage('bot', 'I can help you with crypto prices, trending coins, portfolio tracking, and price charts. Try asking: "What\'s Bitcoin\'s price?", "Show trending cryptos", "I have 1 BTC", "Show Bitcoin chart", or ask about other cryptocurrencies like Ethereum, Litecoin, Cardano, Solana, and more!');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('bot', 'Sorry, I encountered an error while processing your request. Please try again in a moment.');
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
    if (transcript.trim()) {
      addMessage('user', transcript);
      processMessage(transcript);
    }
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
