import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UnreadNotificationsContextType {
  unread: boolean;
  setUnread: (unread: boolean) => void;
}

const UnreadNotificationsContext = createContext<UnreadNotificationsContextType | undefined>(undefined);

export const UnreadNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [unread, setUnread] = useState(false);
  return (
    <UnreadNotificationsContext.Provider value={{ unread, setUnread }}>
      {children}
    </UnreadNotificationsContext.Provider>
  );
};

export const useUnreadNotifications = () => {
  const context = useContext(UnreadNotificationsContext);
  if (!context) {
    throw new Error('useUnreadNotifications must be used within an UnreadNotificationsProvider');
  }
  return context;
}; 