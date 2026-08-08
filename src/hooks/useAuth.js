import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      login: () => {},
      logout: () => {},
      updateUser: () => {},
      isAuthenticated: false,
      loading: false,
    };
  }
  return context;
};