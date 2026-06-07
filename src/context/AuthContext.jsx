import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/AxiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUserState] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("user")) || null;
    if (stored && !stored._id) {
      return { ...stored, _id: stored.id || stored.userId };
    }
    return stored;
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true); // ✅

  // ✅ Returns the promise so .finally() works
  const fetchUserAvatar = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get("/users/profile/avatar");
      setUserState((prev) => {
        const updated = { ...prev, avatar: res.data.avatar };
        localStorage.setItem("user", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Failed to fetch avatar:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      // ✅ inline async so we can properly await and then set initializing
      const init = async () => {
        await fetchUserAvatar();
        setInitializing(false);
      };
      init();
    } else {
      setInitializing(false);
    }
  }, []); // ✅ empty deps — only run once on mount

  const login = (userData, tokenData) => {
    const normalizedUser = {
      ...userData,
      _id: userData._id || userData.id || userData.userId,
    };
    setToken(tokenData);
    setUserState(normalizedUser);
    localStorage.setItem("token", tokenData);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setTimeout(() => fetchUserAvatar(), 100);
  };

  const logout = () => {
    setToken(null);
    setUserState(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const setUser = (userData) => {
    if (!userData) return;
    const normalizedUser = {
      ...userData,
      _id: userData._id || userData.id || userData.userId,
    };
    setUserState(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        login,
        logout,
        isLoggedIn,
        fetchUserAvatar,
        loading,
        initializing, // ✅
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);