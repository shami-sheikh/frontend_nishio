import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import axiosInstance from "../api/AxiosInstance";
import { FiGrid, FiBookmark, FiSettings, FiCamera, FiX, FiCheck, FiLogOut } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Navbar from "../pages/Navbar";

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const { posts } = usePost();
  const [activeTab, setActiveTab] = useState("posts");
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ userName: user?.userName || "", bio: user?.bio || "" });

  const savedPosts = posts.filter(
    (p) => p.saved?.some((id) => String(id) === String(user?._id))
  );
  
  const myPosts = posts.filter(
    (p) => String(p.user?._id) === String(user?._id)
  );

  useEffect(() => {
    setForm({ userName: user?.userName || "", bio: user?.bio || "" });
  }, [user?.userName, user?.bio]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await axiosInstance.put("/users/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      toast.success("Avatar updated successfully");
    } catch {
      toast.error("Failed to update avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const res = await axiosInstance.put("/users/profile/update", form);
      setUser(res.data.user);
      setEditMode(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100 pb-32 font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      
      {/* ── Sticky Luxury Header ── */}
      <div className="sticky top-0 z-40 bg-[#050506]/75 backdrop-blur-xl border-b border-zinc-900/80 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          {user?.userName || "profile"}
        </h1>
        <button
          onClick={() => setEditMode((v) => !v)}
          className={`p-2.5 rounded-xl border transition-all duration-300 ${
            editMode 
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
              : "bg-zinc-900/50 border-zinc-800/60 text-zinc-400 hover:text-white hover:border-zinc-700"
          }`}
        >
          <FiSettings size={18} className={editMode ? "animate-spin-[duration:3s]" : ""} />
        </button>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-8">
        
        {/* ── Profile Information Card ── */}
        <div className="bg-gradient-to-b from-zinc-900/40 to-zinc-900/10 border border-zinc-900 rounded-3xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            
            {/* Avatar block */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden p-[2px] bg-gradient-to-tr from-fuchsia-600 via-violet-500 to-cyan-400 shadow-xl shadow-fuchsia-950/20">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-zinc-950">
                  {uploading ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                      <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.userName}`}
                      alt={user?.userName}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-lg hover:scale-105 active:scale-95 group-hover:border-fuchsia-500/50">
                <FiCamera size={14} className="text-zinc-300 group-hover:text-fuchsia-400 transition-colors" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>

            {/* Metrics Dashboard Row */}
            <div className="grid grid-cols-3 gap-2 flex-1 w-full text-center sm:text-left">
              {[
                { label: "Posts", count: myPosts.length },
                { label: "Followers", count: user?.followers?.length || 0 },
                { label: "Following", count: user?.following?.length || 0 }
              ].map((stat, i) => (
                <div key={i} className="bg-zinc-950/40 border border-zinc-900/50 rounded-2xl p-3 hover:border-zinc-800 transition-colors">
                  <p className="text-lg font-black text-white tracking-tight">{stat.count}</p>
                  <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Edit Mode / Bio Pane */}
          <AnimatePresence mode="wait">
            {editMode ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 pt-2 border-t border-zinc-900"
              >
                <div className="space-y-3">
                  <input
                    type="text"
                    value={form.userName}
                    onChange={(e) => setForm({ ...form, userName: e.target.value })}
                    placeholder="Username"
                    className="w-full bg-zinc-950/80 border border-zinc-800/80 focus:border-fuchsia-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-fuchsia-500/20 transition-all"
                  />
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell your story..."
                    maxLength={150}
                    rows={3}
                    className="w-full bg-zinc-950/80 border border-zinc-800/80 focus:border-fuchsia-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-fuchsia-500/20 resize-none transition-all"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleProfileUpdate}
                    className="flex-1 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <FiCheck size={16} /> Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl px-5 py-3 text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <FiX size={16} />
                  </button>
                </div>
                <button
                  onClick={logout}
                  className="w-full bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 border border-rose-500/10 hover:border-rose-500/20 font-semibold rounded-xl py-2.5 text-xs transition-all flex items-center justify-center gap-2"
                >
                  <FiLogOut size={14} /> Log Out Account
                </button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-2"
              >
                <p className="font-bold text-white text-base tracking-tight">{user?.userName}</p>
                <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed font-normal">
                  {user?.bio || <span className="text-zinc-600 italic">No bio written yet. Click the gears to customize.</span>}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Modern Tabs System ── */}
        <div className="flex bg-zinc-950/60 p-1 border border-zinc-900 rounded-xl mb-6 relative">
          {[
            { id: "posts", label: "Posts", icon: FiGrid },
            { id: "saved", label: "Saved", icon: FiBookmark }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 relative flex items-center justify-center gap-2 py-2.5 text-xs font-bold tracking-wider uppercase z-10 transition-colors duration-300 ${
                  isSelected ? "text-black" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon size={14} />
                {tab.label}
                {isSelected && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white rounded-lg -z-10 shadow-md shadow-white/5"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Content Grid System ── */}
        <motion.div 
          layout
          className="grid grid-cols-3 gap-1.5 sm:gap-2"
        >
          <AnimatePresence mode="popLayout">
            {activeTab === "posts" ? (
              myPosts.length === 0 ? (
                <EmptyState key="empty-posts" type="posts" icon={FiGrid} />
              ) : (
                myPosts.map((post) => (
                  <PostThumbnail key={post._id} post={post} />
                ))
              )
            ) : (
              savedPosts.length === 0 ? (
                <EmptyState key="empty-saved" type="saved" icon={FiBookmark} />
              ) : (
                savedPosts.map((post) => (
                  <PostThumbnail key={post._id} post={post} />
                ))
              )
            )}
          </AnimatePresence>
        </motion.div>

      </div>
      <Navbar />
    </div>
  );
};

// ── Fluid Post Thumbnail ──
const PostThumbnail = ({ post }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="relative aspect-square overflow-hidden bg-zinc-900 border border-zinc-950 rounded-xl cursor-pointer group"
    >
      {post.type === "reel" ? (
        <video src={post.mediaUrl} preload="metadata" className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
      ) : (
        <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
      )}

      {/* Modern Backdrop Hover Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
        <div className="flex items-center gap-1.5 text-white font-black text-sm tracking-tight scale-90 group-hover:scale-100 transition-transform duration-300">
          <AiFillHeart size={18} className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          {post.likes?.length || 0}
        </div>
      </div>

      {/* Reel Pill Indicator */}
      {post.type === "reel" && (
        <div className="absolute top-2 right-2 bg-zinc-950/80 border border-zinc-800/40 backdrop-blur-md rounded-lg px-2 py-0.5 text-[9px] font-black tracking-widest text-cyan-400 uppercase">
          Reel
        </div>
      )}
    </motion.div>
  );
};

// ── Modular Empty State Component ──
const EmptyState = ({ type, icon: Icon }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-20 col-span-3 flex flex-col items-center justify-center"
  >
    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
      <Icon size={22} className="text-zinc-500" />
    </div>
    <p className="text-zinc-200 font-bold tracking-tight">No {type} yet</p>
    <p className="text-zinc-500 text-xs mt-1 max-w-[200px] leading-relaxed">
      {type === "posts" ? "Share your first image capture or short video." : "Save items to keep track of your collections."}
    </p>
  </motion.div>
);

export default Profile;