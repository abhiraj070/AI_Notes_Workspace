import { createContext, useContext, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);
const STORAGE_KEY = "ainotes:user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const persist = (u) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/users/login", { email, password });
    persist(data.data.user);
    return data.data.user;
  };

  const register = async (name, email, password) => {
    await api.post("/users/register", { name, email, password });
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
