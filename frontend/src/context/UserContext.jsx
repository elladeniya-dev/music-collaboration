import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    authService.getCurrentUser()
      .then((userData) => {
        setUser(userData);
        setLoadingUser(false);
      })
      .catch(() => {
        setUser(null);
        setLoadingUser(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser, onlineUsers, setOnlineUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); // ✅ this line must be here
