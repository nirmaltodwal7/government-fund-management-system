import React, { createContext, useContext, useState, useEffect } from 'react';

const GlobalFundsContext = createContext();

export const useGlobalFunds = () => {
  const context = useContext(GlobalFundsContext);
  if (!context) {
    throw new Error('useGlobalFunds must be used within a GlobalFundsProvider');
  }
  return context;
};

export const GlobalFundsProvider = ({ children }) => {
  const [governmentFunds, setGovernmentFunds] = useState(12000);
  const [transactionHistory, setTransactionHistory] = useState([]);

  // Load funds and history from localStorage on mount
  useEffect(() => {
    // Check if this is a fresh session (server restart)
    const sessionKey = 'fundsSessionActive';
    const isNewSession = !sessionStorage.getItem(sessionKey);
    
    if (isNewSession) {
      // Reset funds to initial value and clear history on server restart
      setGovernmentFunds(12000);
      setTransactionHistory([]);
      sessionStorage.setItem(sessionKey, 'true');
    } else {
      // Load saved data from previous session
      const savedFunds = localStorage.getItem('globalGovernmentFunds');
      const savedHistory = localStorage.getItem('globalTransactionHistory');
      
      if (savedFunds) {
        setGovernmentFunds(parseInt(savedFunds));
      }
      
      if (savedHistory) {
        setTransactionHistory(JSON.parse(savedHistory));
      }
    }
  }, []);

  // Save funds and history to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('globalGovernmentFunds', governmentFunds.toString());
  }, [governmentFunds]);

  useEffect(() => {
    localStorage.setItem('globalTransactionHistory', JSON.stringify(transactionHistory));
  }, [transactionHistory]);

  const deductFunds = (amount, userInfo, pensionMonth) => {
    setGovernmentFunds(prev => {
      const newAmount = Math.max(0, prev - amount); // Ensure it doesn't go below 0
      return newAmount;
    });

    // Add transaction to history
    const transaction = {
      id: Date.now(),
      type: 'pension_claim',
      amount: amount,
      userInfo: userInfo,
      pensionMonth: pensionMonth,
      timestamp: new Date().toISOString(),
      remainingFunds: governmentFunds - amount
    };

    setTransactionHistory(prev => [transaction, ...prev]);
  };

  const addFunds = (amount) => {
    setGovernmentFunds(prev => prev + amount);
  };

  const resetFunds = () => {
    setGovernmentFunds(12000);
    setTransactionHistory([]);
    // Clear session to ensure fresh start
    sessionStorage.removeItem('fundsSessionActive');
  };

  const forceReset = () => {
    setGovernmentFunds(12000);
    setTransactionHistory([]);
    sessionStorage.removeItem('fundsSessionActive');
    localStorage.removeItem('globalGovernmentFunds');
    localStorage.removeItem('globalTransactionHistory');
  };

  const value = {
    governmentFunds,
    transactionHistory,
    deductFunds,
    addFunds,
    resetFunds,
    forceReset
  };

  return (
    <GlobalFundsContext.Provider value={value}>
      {children}
    </GlobalFundsContext.Provider>
  );
};
