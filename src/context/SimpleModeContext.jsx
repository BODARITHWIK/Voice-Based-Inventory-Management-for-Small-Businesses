import React, { createContext, useContext, useState } from 'react';

const SimpleModeContext = createContext();

export const SimpleModeProvider = ({ children }) => {
  const [simpleMode, setSimpleModeState] = useState(() => {
    try {
      return localStorage.getItem('swaranidhi_simple_mode') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [ttsEnabled, setTtsEnabledState] = useState(() => {
    try {
      const val = localStorage.getItem('swaranidhi_tts_enabled');
      return val === null ? true : val === 'true'; // enabled by default for friendly voice experience
    } catch (e) {
      return true;
    }
  });

  const setSimpleMode = (val) => {
    setSimpleModeState(val);
    try {
      localStorage.setItem('swaranidhi_simple_mode', String(val));
    } catch (e) {
      // ignore
    }
  };

  const setTtsEnabled = (val) => {
    setTtsEnabledState(val);
    try {
      localStorage.setItem('swaranidhi_tts_enabled', String(val));
    } catch (e) {
      // ignore
    }
  };

  return (
    <SimpleModeContext.Provider
      value={{
        simpleMode,
        setSimpleMode,
        toggleSimpleMode: () => setSimpleMode(!simpleMode),
        ttsEnabled,
        setTtsEnabled,
        toggleTts: () => setTtsEnabled(!ttsEnabled),
      }}
    >
      {children}
    </SimpleModeContext.Provider>
  );
};

export const useSimpleMode = () => {
  const context = useContext(SimpleModeContext);
  if (!context) {
    throw new Error('useSimpleMode must be used within a SimpleModeProvider');
  }
  return context;
};
