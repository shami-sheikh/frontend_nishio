import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axiosInstance from "../api/AxiosInstance";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/notifications/unread");
      setUnreadCount(res.data.count || 0);
    } catch {}
  }, []);

  // poll unread count every 30 seconds
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, fetchUnreadCount]);

  const markAllRead = async () => {
    try {
      await axiosInstance.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const markOneRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const deleteOne = async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {}
  };

  const deleteAll = async () => {
    try {
      await axiosInstance.delete("/notifications/delete-all");
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      fetchUnreadCount,
      markAllRead,
      markOneRead,
      deleteOne,
      deleteAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);