
import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceInputProps {
  onVoiceInput: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  currentTranscript: string;
  setCurrentTranscript: (transcript: string) => void;
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
  setIsListening,
  currentTranscript,
  setCurrentTranscript
}) => {
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Show live transcription
        const currentText = finalTranscript || interimTranscript;
        setCurrentTranscript(currentText);
        console.log('Live transcript:', currentText);
      };

      recognitionInstance.onend = () => {
        console.log('Voice recognition ended');
        if (currentTranscript.trim()) {
          onVoiceInput(currentTranscript);
        }
        setIsListening(false);
        setCurrentTranscript('');
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setCurrentTranscript('');
      };

      recognitionInstance.onstart = () => {
        console.log('Voice recognition started');
        setCurrentTranscript('');
      };

      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      console.log('Speech recognition not supported');
    }
  }, [onVoiceInput, setIsListening, currentTranscript, setCurrentTranscript]);

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
      {/* Live Transcript Display */}
      {isListening && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 min-h-[50px] max-w-md">
          <div className="text-sm text-gray-300 mb-1">Listening...</div>
          <div className="text-white min-h-[20px]">
            {currentTranscript || <span className="text-gray-400 italic">Start speaking...</span>}
          </div>
        </div>
      )}
      
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
          Click microphone or stop speaking to process command
        </div>
      )}
    </div>
  );
};
