import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../api/backend";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCurrentUser()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function signup(credentials) {
    const data = await api.signup(credentials);
    setUser(data);
    return data;
  }

  async function login(credentials) {
    const data = await api.login(credentials);
    setUser(data);
    return data;
  }

  async function loginWithGoogle(credential) {
    const data = await api.loginWithGoogle(credential);
    setUser(data);
    return data;
  }

  async function logout() {
    await api.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signup,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
