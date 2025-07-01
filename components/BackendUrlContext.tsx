import React, { createContext, useContext, useState } from 'react';
import { Platform } from 'react-native';

// Default backend URL based on platform
const DEFAULT_BACKEND_URL = Platform.OS === 'web' 
  ? 'http://192.168.1.6:5000' 
  : 'http://192.168.1.6:5000';

const BackendUrlContext = createContext({
  backendUrl: DEFAULT_BACKEND_URL,
  setBackendUrl: (url: string) => {},
  loading: false,
});

export const BackendUrlProvider = ({ children }: { children: React.ReactNode }) => {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);

  return (
    <BackendUrlContext.Provider value={{ backendUrl, setBackendUrl, loading: false }}>
      {children}
    </BackendUrlContext.Provider>
  );
};

export const useBackendUrl = () => useContext(BackendUrlContext);