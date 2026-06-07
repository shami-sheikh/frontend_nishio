import { useEffect } from "react";
import { useNotification } from "../context/NotificationContext";
import { FiX, FiTrash2, FiCheck } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { FiUserPlus, FiMessageCircle } from "react-icons/fi";
import {NavLink} from "react-router-dom"
const icons = {
  like:      <AiFillHeart size={14} className="text-rose-400" />,
  reel_like: <AiFillHeart size={14} className="text-rose-400" />,
  comment:   <FiMessageCircle size={14} className="text-blue-400" />,
  reply:     <FiMessageCircle size={14} className="text-fuchsia-400" />,
  follow:    <FiUserPlus size={14} className="text-emerald-400" />,
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const NotificationPanel = ({ onClose }) => {
  const {
    notifications, loading,
    fetchNotifications, markAllRead,
    markOneRead, deleteOne, deleteAll,
  } = useNotification();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end md:items-start md:justify-end pt-16 pr-4 md:pt-14 md:pr-6">
      {/* backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900">
          <h2 className="text-white font-bold text-sm">Notifications</h2>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] text-fuchsia-400 hover:text-fuchsia-300 transition-colors font-medium"
              >
                <FiCheck size={12} /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={deleteAll}
                className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors"
              >
                Clear all
              </button>
            )}
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors ml-1">
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-48 h-3 bg-zinc-800 rounded" />
                    <div className="w-24 h-2 bg-zinc-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <p className="font-bold text-sm">No notifications yet</p>
              <p className="text-xs mt-1">When someone likes or follows you, it'll show here</p>
            </div>
          ) : (
            <div>
           {notifications.map((n) => (
  <div
    key={n._id}
    onClick={() => !n.isRead && markOneRead(n._id)}
    className={`flex items-start gap-3 px-4 py-3 border-b border-zinc-900/50 hover:bg-zinc-900/30 transition-colors cursor-pointer ${
      !n.isRead ? "bg-fuchsia-500/5" : ""
    }`}
  >
    {/* Avatar */}
    <div className="relative shrink-0">
      <img
        src={n.sender?.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${n.sender?.userName}`}
        className="w-9 h-9 rounded-full object-cover"
        alt={n.sender?.userName}
      />
      <div className="absolute -bottom-0.5 -right-0.5 bg-zinc-950 rounded-full p-0.5">
        {icons[n.type]}
      </div>
    </div>

    {/* ✅ Message — clicking goes to sender profile */}
    <NavLink
      to={`/profile/${n.sender?._id}`}
      onClick={onClose}
      className="flex-1 min-w-0"
    >
      <p className="text-sm text-zinc-300 leading-snug">
        <span className="font-bold text-white">@{n.sender?.userName}</span>
        {" "}{n.message.replace(n.sender?.userName, "").trim()}
      </p>
      <p className="text-[10px] text-zinc-600 mt-0.5">{timeAgo(n.createdAt)}</p>
    </NavLink>

    {/* Unread dot + delete */}
    <div className="flex flex-col items-end gap-2 shrink-0">
      {!n.isRead && (
        <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
      )}
      <button
        onClick={(e) => { e.stopPropagation(); deleteOne(n._id); }}
        className="text-zinc-700 hover:text-rose-400 transition-colors"
      >
        <FiTrash2 size={12} />
      </button>
    </div>
  </div>
))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;