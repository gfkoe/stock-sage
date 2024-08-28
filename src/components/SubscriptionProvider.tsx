"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type SubscriptionProviderProps = {
  children: ReactNode; // Explicitly type children as ReactNode
};

const SubscriptionContext = createContext<{
  subscription: PushSubscription | null;
  registration: ServiceWorkerRegistration | null;
  isSubscribed: boolean;
  setSubscription: React.Dispatch<
    React.SetStateAction<PushSubscription | null>
  >;
  setIsSubscribed: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({
  children,
}) => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
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

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return context;
};
