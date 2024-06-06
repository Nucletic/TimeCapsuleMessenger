import React, { createContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [showAds, setShowAds] = useState(null);

  return (
    <AppContext.Provider value={{ showAds, setShowAds }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;