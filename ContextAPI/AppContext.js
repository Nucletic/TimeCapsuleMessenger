import React, { createContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [CustomUUID, setCustomUUID] = useState(null);

  return (
    <AppContext.Provider value={{ CustomUUID, setCustomUUID }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;