import { useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { FiArrowLeft, FiSend, FiPaperclip, FiUsers } from "react-icons/fi";
import Navbar from "./Navbar";

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const Chat = () => {
  const { user } = useAuth();
  
  const { isOnline } = useSocket();
  const {
    conversations, activeConversation, messages,
    typingUsers, loading,
    openConversation, sendMessage, startTyping, stopTyping,
    setActiveConversation,
  } = useChat();

  const [text, setText] = useState("");
  let typingTimeout;

  const handleTextChange = (e) => {
    setText(e.target.value);
    startTyping();
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(stopTyping, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
    stopTyping();
  };

  const getOtherUser = (conversation) => {
    if (conversation.isGroup) return null;
    return conversation.participants.find((p) => String(p._id) !== String(user?._id));
  };

  const typing = activeConversation ? typingUsers[activeConversation._id] : null;

  return (
    <div className="min-h-screen bg-[#080808] text-white pb-20 md:pb-0 md:pl-64 flex">

      {/* ── Conversation list ── */}
      <div className={`w-full md:w-80 border-r border-zinc-900 ${activeConversation ? "hidden md:block" : "block"}`}>
        <div className="sticky top-0 bg-[#080808]/90 backdrop-blur-xl border-b border-zinc-900 px-5 py-4">
          <h1 className="text-lg font-black bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            Messages
          </h1>
        </div>

        <div className="overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              <p className="font-bold">No conversations yet</p>
              <p className="text-xs mt-1">Visit a profile and tap message</p>
            </div>
          ) : (
            conversations.map((c) => {
              const other = getOtherUser(c);
              const name = c.isGroup ? c.groupName : other?.userName;
              const avatar = c.isGroup
                ? c.groupAvatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${c.groupName}`
                : other?.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${other?.userName}`;
              const online = !c.isGroup && isOnline(other?._id);

              return (
                <button
                  key={c._id}
                  onClick={() => openConversation(c)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900/50 transition-colors text-left ${
                    activeConversation?._id === c._id ? "bg-zinc-900/50" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={avatar} className="w-12 h-12 rounded-full object-cover" />
                    {online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#080808]" />
                    )}
                    {c.isGroup && (
                      <div className="absolute -bottom-1 -right-1 bg-zinc-800 rounded-full p-1">
                        <FiUsers size={10} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{name}</p>
                    <p className="text-xs text-zinc-500 truncate">
                      {c.lastMessage?.text || "Start a conversation"}
                    </p>
                  </div>
                  {c.lastMessage?.createdAt && (
                    <span className="text-[10px] text-zinc-600 shrink-0">{timeAgo(c.lastMessage.createdAt)}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat window ── */}
      <div className={`flex-1 flex flex-col ${activeConversation ? "flex" : "hidden md:flex"}`}>
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <p>Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-[#080808]/90 backdrop-blur-xl border-b border-zinc-900 px-4 py-3 flex items-center gap-3">
              <button onClick={() => setActiveConversation(null)} className="md:hidden text-zinc-400">
                <FiArrowLeft size={20} />
              </button>
              {(() => {
                const other = getOtherUser(activeConversation);
                const name = activeConversation.isGroup ? activeConversation.groupName : other?.userName;
                const avatar = activeConversation.isGroup
                  ? activeConversation.groupAvatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${activeConversation.groupName}`
                  : other?.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${other?.userName}`;
                const online = !activeConversation.isGroup && isOnline(other?._id);
                return (
                  <>
                    <div className="relative">
                      <img src={avatar} className="w-9 h-9 rounded-full object-cover" />
                      {online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080808]" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{name}</p>
                      <p className="text-[10px] text-zinc-500">{online ? "Online" : "Offline"}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-hide">
              {loading ? (
                <p className="text-center text-zinc-500 text-sm">Loading...</p>
              ) : (
                messages.map((m) => {
                  const isMe = String(m.sender?._id) === String(user?._id);
                  return (
                    <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                        isMe ? "bg-fuchsia-600 text-white" : "bg-zinc-800 text-zinc-200"
                      }`}>
                        {m.mediaUrl && (
                          <img src={m.mediaUrl} className="rounded-xl mb-1 max-w-full" />
                        )}
                        {m.text && <p>{m.text}</p>}
                        <p className="text-[10px] opacity-60 mt-1">{timeAgo(m.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              )}
              {typing && (
                <p className="text-xs text-zinc-500 italic">{typing.userName} is typing...</p>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-zinc-900 px-4 py-3 flex items-center gap-2">
              <input
                value={text}
                onChange={handleTextChange}
                placeholder="Message..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500/50"
              />
              <button type="submit" disabled={!text.trim()} className="p-2 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40 transition-colors">
                <FiSend size={16} />
              </button>
            </form>
          </>
        )}
      </div>

      <Navbar />
    </div>
  );
};

export default Chat;