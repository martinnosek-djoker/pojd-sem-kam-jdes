"use client";

import { useState, useEffect } from "react";
import { IS_MOBILE } from "@/lib/api-config";

interface TextToSpeechProps {
  text: string;
  title?: string;
}

export default function TextToSpeech({ text, title }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [TextToSpeechPlugin, setTextToSpeechPlugin] = useState<any>(null);
  const [isAndroidBrowser, setIsAndroidBrowser] = useState(false);

  useEffect(() => {
    // Detect Android browser (not Capacitor app)
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isAndroid = /android/i.test(userAgent);
    setIsAndroidBrowser(isAndroid && !IS_MOBILE);

    // Detect mobile environment
    setIsMobile(IS_MOBILE);

    // Initialize TTS based on environment
    if (IS_MOBILE) {
      // Mobile: Use Capacitor TTS plugin
      initMobileTTS();
    } else {
      // Web: Use Web Speech API
      initWebTTS();
    }

    return () => {
      if (!IS_MOBILE && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const initMobileTTS = async () => {
    try {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
      setTextToSpeechPlugin(TextToSpeech);
      setIsSupported(true);
      console.log('✅ Mobile TTS initialized');
    } catch (error) {
      console.error('❌ Failed to load Mobile TTS:', error);
      setIsSupported(false);
    }
  };

  const initWebTTS = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Load available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();

        // Filter Czech voices only
        const czechVoices = availableVoices.filter(voice =>
          voice.lang.startsWith('cs') || voice.lang.startsWith('cs-CZ')
        );

        // Only enable TTS if Czech voices are available
        if (czechVoices.length > 0) {
          setVoices(czechVoices);
          setSelectedVoice(czechVoices[0]);
          setIsSupported(true);
        } else {
          setIsSupported(false);
        }
      };

      // Voices might load asynchronously
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  };

  const extractPlainText = (html: string): string => {
    // Remove HTML tags and convert to plain text
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Replace <br>, <p> with newlines for better speech flow
    temp.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    temp.querySelectorAll('p').forEach(p => {
      const text = p.textContent || '';
      p.replaceWith(text + '\n\n');
    });

    let plainText = temp.textContent || temp.innerText || '';

    // Clean up extra whitespace
    plainText = plainText.replace(/\n{3,}/g, '\n\n').trim();

    return plainText;
  };

  const fixCzechPronunciation = (text: string): string => {
    // Slovník oprav výslovnosti pro české text-to-speech
    const pronunciationFixes: Record<string, string> = {
      // Pizza píšeme jako "pica" ale vyslovuje se "pitsa"
      'pica': 'pitsa',
      'pice': 'pitse',
      'pici': 'pitsi',
      'picu': 'pitsu',
      'picou': 'pitsou',
      'Pica': 'Pitsa',
      'Pice': 'Pitse',
      'Pici': 'Pitsi',
      'Picu': 'Pitsu',
      'Picou': 'Pitsou',

      // Další problematická slova můžeme přidat
      'bruschetta': 'brusketa',
      'Bruschetta': 'Brusketa',
      'gnocchi': 'ňoky',
      'Gnocchi': 'Ňoky',
      'prosciutto': 'prošuto',
      'Prosciutto': 'Prošuto',
      'focaccia': 'fokača',
      'Focaccia': 'Fokača',
      'tiramisu': 'tiramisu',
      'Tiramisu': 'Tiramisu',
      'carpaccio': 'karpačo',
      'Carpaccio': 'Karpačo',
      'panna cotta': 'pana kota',
      'Panna cotta': 'Pana kota',
      'Panna Cotta': 'Pana Kota',
      'mozzarella': 'mocarela',
      'Mozzarella': 'Mocarela',
      'risotto': 'rizoto',
      'Risotto': 'Rizoto',
      'espresso': 'espreso',
      'Espresso': 'Espreso',
      'cappuccino': 'kapučíno',
      'Cappuccino': 'Kapučíno',
      'latte': 'late',
      'Latte': 'Late',
      'macchiato': 'makjato',
      'Macchiato': 'Makjato',
    };

    let fixedText = text;

    // Postupně nahradit všechna problematická slova
    Object.entries(pronunciationFixes).forEach(([wrong, correct]) => {
      // Použít word boundary (\b) aby se nenahradily části slov
      const regex = new RegExp(`\\b${wrong}\\b`, 'g');
      fixedText = fixedText.replace(regex, correct);
    });

    return fixedText;
  };

  const handlePlayMobile = async () => {
    if (!TextToSpeechPlugin) return;

    try {
      // Extract plain text from HTML
      const plainText = extractPlainText(text);

      // Create title text if provided
      let fullText = title ? `${title}. ${plainText}` : plainText;

      // Fix Czech pronunciation issues
      fullText = fixCzechPronunciation(fullText);

      setIsPlaying(true);
      setIsPaused(false);

      await TextToSpeechPlugin.speak({
        text: fullText,
        lang: 'cs-CZ',
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient',
      });

      // After speaking completes
      setIsPlaying(false);
      setIsPaused(false);
    } catch (error) {
      console.error('Mobile TTS error:', error);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleStopMobile = async () => {
    if (!TextToSpeechPlugin) return;

    try {
      await TextToSpeechPlugin.stop();
      setIsPlaying(false);
      setIsPaused(false);
    } catch (error) {
      console.error('Mobile TTS stop error:', error);
    }
  };

  const handlePlayWeb = () => {
    if (!isSupported) return;

    // If paused, resume
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Extract plain text from HTML
    const plainText = extractPlainText(text);

    // Create title text if provided
    let fullText = title ? `${title}. ${plainText}` : plainText;

    // Fix Czech pronunciation issues
    fullText = fixCzechPronunciation(fullText);

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'cs-CZ';
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseWeb = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStopWeb = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Unified handlers
  const handlePlay = () => {
    if (isMobile) {
      handlePlayMobile();
    } else {
      handlePlayWeb();
    }
  };

  const handlePause = () => {
    if (isMobile) {
      // Mobile doesn't support pause, only stop
      handleStopMobile();
    } else {
      handlePauseWeb();
    }
  };

  const handleStop = () => {
    if (isMobile) {
      handleStopMobile();
    } else {
      handleStopWeb();
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="space-y-3">
      {/* Android browser notice */}
      {isAndroidBrowser && (
        <div className="flex items-start gap-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm text-blue-300">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-semibold mb-1">💡 Tip pro lepší poslechový zážitek</div>
            <div className="text-xs text-blue-200">
              Pro nejlepší českou výslovnost doporučujeme použít naši mobilní aplikaci.
              V prohlížeči může být výslovnost omezená.
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {/* Play/Pause/Stop buttons */}
        <div className="flex items-center gap-2">
        {!isPlaying && !isPaused ? (
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-medium active:scale-95"
            title="Přehrát text"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.05 7.44-7 7.93V19h4v2H8v-2h4v-3.07z"/>
            </svg>
            <span>Poslechnout si recenzi</span>
          </button>
        ) : (
          <>
            {isPlaying && !isMobile && (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all font-medium active:scale-95"
                title="Pozastavit"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
                <span>Pozastavit</span>
              </button>
            )}
            {isPaused && (
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-medium active:scale-95"
                title="Pokračovat"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Pokračovat</span>
              </button>
            )}
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium active:scale-95"
              title="Zastavit"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z"/>
              </svg>
              <span>Zastavit</span>
            </button>
          </>
        )}
        </div>

        {/* Voice selector (only for web) */}
        {!isMobile && voices.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all text-sm active:scale-95"
              title="Vybrat hlas"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
              </svg>
              <span>Hlas</span>
            </button>

            {showVoiceSelector && (
              <div className="absolute top-full mt-2 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[250px] max-h-[300px] overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs text-gray-400 px-2 py-1 mb-1">Vyberte hlas:</div>
                  {voices.map((voice, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedVoice(voice);
                        setShowVoiceSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedVoice?.name === voice.name
                          ? 'bg-purple-600 text-white'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-xs text-gray-400">
                        {voice.lang} {voice.localService ? '(Local)' : '(Online)'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
