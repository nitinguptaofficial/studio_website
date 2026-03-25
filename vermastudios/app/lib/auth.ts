// Authentication utilities for frontend

const TOKEN_KEY = 'varmastudios_admin_token';
const USERNAME_KEY = 'varmastudios_admin_username';

export const setAuthToken = (token: string, username: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USERNAME_KEY, username);
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const getAuthUsername = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(USERNAME_KEY);
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
