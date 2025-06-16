
import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
  onVoiceInput: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

// Add type declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onVoiceInput,
  isListening,
  setIsListening
}) => {
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice transcript:', transcript);
        onVoiceInput(transcript);
      };

      recognitionInstance.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onstart = () => {
        console.log('Voice recognition started');
      };

      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      console.log('Speech recognition not supported');
    }
  }, [onVoiceInput, setIsListening]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      console.log('Stopping voice recognition');
      recognition.stop();
      setIsListening(false);
    } else {
      console.log('Starting voice recognition');
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        setIsListening(false);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex flex-col items-center mt-4 space-y-3">
      {/* Microphone Button */}
      <Button
        onClick={toggleListening}
        variant="outline"
        className={`rounded-full w-16 h-16 ${
          isListening 
            ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
            : 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20'
        }`}
      >
        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </Button>
      
      {isListening && (
        <div className="text-xs text-gray-400 text-center">
          Listening... Speak now
        </div>
      )}
    </div>
  );
};
