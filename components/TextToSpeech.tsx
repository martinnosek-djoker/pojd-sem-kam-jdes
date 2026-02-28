"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      // Load available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();

        // Filter Czech voices
        const czechVoices = availableVoices.filter(voice =>
          voice.lang.startsWith('cs') || voice.lang.startsWith('cs-CZ')
        );

        setVoices(czechVoices.length > 0 ? czechVoices : availableVoices);

        // Select default Czech voice or first available
        if (czechVoices.length > 0) {
          setSelectedVoice(czechVoices[0]);
        } else if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0]);
        }
      };

      // Voices might load asynchronously
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

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

  const handlePlay = () => {
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
    const fullText = title ? `${title}. ${plainText}` : plainText;

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

  const handlePause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
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
            {isPlaying && (
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

      {/* Voice selector */}
      {voices.length > 1 && (
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
  );
}
