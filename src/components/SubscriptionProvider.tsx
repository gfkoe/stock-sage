"use client";
import { createContext, useContext, useState, useEffect } from "react";

// Create the SubscriptionContext
const SubscriptionContext = createContext(null);

// Create a Provider component
export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
        setRegistration(reg);
      });
    }
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        registration,
        isSubscribed,
        setSubscription,
        setIsSubscribed,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

// Create a custom hook to use the SubscriptionContext
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
};
