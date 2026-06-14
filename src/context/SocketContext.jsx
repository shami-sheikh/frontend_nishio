import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "");

export const SocketProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn || !user?._id) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.emit("user_online", user._id);

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn, user?._id]);

  const isOnline = (userId) => onlineUsers.includes(String(userId));

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);