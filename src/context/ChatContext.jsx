import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axiosInstance from "../api/AxiosInstance";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import toast from "react-hot-toast";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/chat/conversations");
      setConversations(res.data.conversations || []);
    } catch {
      toast.error("Failed to load conversations");
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchConversations();
  }, [isLoggedIn, fetchConversations]);

  // listen for incoming messages
useEffect(() => {
  if (!socket) return;

  const handleReceive = (message) => {
    if (activeConversation && message.conversation === activeConversation._id) {
      // ✅ check if message already exists to avoid duplicates
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        return exists ? prev : [...prev, message];
      });
    }
    // update conversation list preview
    setConversations((prev) =>
      prev.map((c) =>
        c._id === message.conversation 
          ? { ...c, lastMessage: message, updatedAt: new Date() } 
          : c
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  };

  const handleTyping = ({ conversationId, userId, userName }) => {
    setTypingUsers((prev) => ({ ...prev, [conversationId]: { userId, userName } }));
  };

  const handleStopTyping = ({ conversationId }) => {
    setTypingUsers((prev) => {
      const updated = { ...prev };
      delete updated[conversationId];
      return updated;
    });
  };

  socket.on("receive_message", handleReceive);
  socket.on("user_typing", handleTyping);
  socket.on("user_stop_typing", handleStopTyping);

  return () => {
    socket.off("receive_message", handleReceive);
    socket.off("user_typing", handleTyping);
    socket.off("user_stop_typing", handleStopTyping);
  };
}, [socket, activeConversation]);
  // open a conversation — fetch messages + join socket room
  const openConversation = async (conversation) => {
    if (activeConversation && socket) {
      socket.emit("leave_conversation", activeConversation._id);
    }

    setActiveConversation(conversation);
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/chat/${conversation._id}/messages`);
      setMessages(res.data.messages || []);
      socket?.emit("join_conversation", conversation._id);
      await axiosInstance.put(`/chat/${conversation._id}/seen`);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  // start a DM with someone
  const startConversation = async (userId) => {
    try {
      const res = await axiosInstance.get(`/chat/conversations/${userId}/start`);
      const convo = res.data.conversation;
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === convo._id);
        return exists ? prev : [convo, ...prev];
      });
      await openConversation(convo);
      return convo;
    } catch {
      toast.error("Failed to start conversation");
    }
  };

  // send message via socket + save to DB
 const sendMessage = async (text, file = null) => {
  if (!activeConversation || (!text.trim() && !file)) return;

  try {
    let res;
    if (file) {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("text", text.trim());
      res = await axiosInstance.post(`/chat/${activeConversation._id}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      res = await axiosInstance.post(`/chat/${activeConversation._id}/messages`, { text: text.trim() });
    }

    const message = res.data.message;
    
    // ✅ only add if not already in messages
    setMessages((prev) => {
      const exists = prev.some((m) => m._id === message._id);
      return exists ? prev : [...prev, message];
    });
    
    // don't emit here — let socket.io handle it from backend
    // socket?.emit("send_message", message);

    setConversations((prev) =>
      prev.map((c) =>
        c._id === activeConversation._id ? { ...c, lastMessage: message, updatedAt: new Date() } : c
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  } catch {
    toast.error("Failed to send message");
  }
};

  // typing indicators
  const startTyping = () => {
    if (!activeConversation || !socket) return;
    socket.emit("typing", {
      conversationId: activeConversation._id,
      userId: user._id,
      userName: user.userName,
    });
  };

  const stopTyping = () => {
    if (!activeConversation || !socket) return;
    socket.emit("stop_typing", { conversationId: activeConversation._id, userId: user._id });
  };

  // create group
  const createGroup = async (groupName, participantIds) => {
    try {
      const res = await axiosInstance.post("/chat/group", { groupName, participantIds });
      setConversations((prev) => [res.data.conversation, ...prev]);
      toast.success("Group created!");
      return res.data.conversation;
    } catch {
      toast.error("Failed to create group");
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      messages,
      typingUsers,
      loading,
      fetchConversations,
      openConversation,
      startConversation,
      sendMessage,
      startTyping,
      stopTyping,
      createGroup,
      setActiveConversation,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);