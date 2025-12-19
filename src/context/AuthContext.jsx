// Filename: src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // CHANGED: localStorage -> sessionStorage
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setUser(data);
      // CHANGED: localStorage -> sessionStorage
      sessionStorage.setItem('user', JSON.stringify(data));
      return data; 
    } else {
      throw new Error(data.error || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();

    if (response.ok) {
      setUser(data);
      // CHANGED: localStorage -> sessionStorage
      sessionStorage.setItem('user', JSON.stringify(data));
      return data;
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  };

  const logout = async () => {
    setUser(null);
    // CHANGED: localStorage -> sessionStorage
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}