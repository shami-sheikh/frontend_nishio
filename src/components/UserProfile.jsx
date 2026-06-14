import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiGrid, FiArrowLeft, FiMessageCircle } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import { FiUserPlus, FiUserCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useFollow } from "../context/FollowContext";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import axiosInstance from "../api/AxiosInstance";
import Navbar from "../pages/Navbar";

const UserProfile = () => {
  const { startConversation } = useChat();
  const { userId } = useParams();
  const navigate = useNavigate();

const handleMessage = async () => {
  await startConversation(profileUser._id);
  navigate("/chat");
};

  const { user: currentUser } = useAuth();
  const { toggleFollow, isFollowing } = useFollow();
  const { posts } = usePost();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ If it's your own profile, redirect to /profile
  useEffect(() => {
    if (String(userId) === String(currentUser?._id)) {
      navigate("/profile", { replace: true });
      return;
    }
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/users/alluser`);
      const found = res.data.users?.find(
        (u) => String(u._id) === String(userId)
      );
      setProfileUser(found || null);
    } catch {
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  };

  // their posts from PostContext
  const theirPosts = posts.filter(
    (p) => String(p.user?._id) === String(userId)
  );

  const following = isFollowing(userId);

  if (loading) return (
    <div className="min-h-screen bg-[#050506] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profileUser) return (
    <div className="min-h-screen bg-[#050506] flex flex-col items-center justify-center gap-4">
      <p className="text-white font-bold text-lg">User not found</p>
      <button onClick={() => navigate(-1)} className="text-fuchsia-400 text-sm">Go back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100 pb-32 font-sans">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#050506]/75 backdrop-blur-xl border-b border-zinc-900/80 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/60 text-zinc-400 hover:text-white transition-colors"
        >
          <FiArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-black tracking-tight text-white flex-1">
          @{profileUser.userName}
        </h1>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-8">

        {/* Profile Card */}
        <div className="bg-gradient-to-b from-zinc-900/40 to-zinc-900/10 border border-zinc-900 rounded-3xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden p-[2px] bg-gradient-to-tr from-fuchsia-600 via-violet-500 to-cyan-400 shadow-xl shrink-0">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-zinc-950">
                <img
                  src={profileUser.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${profileUser.userName}`}
                  alt={profileUser.userName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 flex-1 w-full text-center">
              {[
                { label: "Posts", count: theirPosts.length },
                { label: "Followers", count: profileUser.followers?.length || 0 },
                { label: "Following", count: profileUser.following?.length || 0 },
              ].map((stat, i) => (
                <div key={i} className="bg-zinc-950/40 border border-zinc-900/50 rounded-2xl p-3">
                  <p className="text-lg font-black text-white">{stat.count}</p>
                  <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bio + Follow */}
          <div className="pt-2 border-t border-zinc-900 space-y-4">
            <div>
              <p className="font-bold text-white text-base">{profileUser.userName}</p>
              <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                {profileUser.bio || <span className="text-zinc-600 italic">No bio yet</span>}
              </p>
            </div>

            {/* Follow button */}
            <button
              onClick={() => toggleFollow(profileUser._id)}
              className={`w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${
                following
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                  : "bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-950/30"
              }`}
            >
              {following ? <><FiUserCheck size={16} /> Following</> : <><FiUserPlus size={16} /> Follow</>}
            </button>
            <button
  onClick={handleMessage}
  className="flex-1 py-3 rounded-2xl text-sm font-bold bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center gap-2"
>
  <FiMessageCircle size={16} /> Message
</button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-1.5">
          <AnimatePresence>
            {theirPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-3 text-center py-20"
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <FiGrid size={22} className="text-zinc-500" />
                </div>
                <p className="text-zinc-400 font-bold">No posts yet</p>
              </motion.div>
            ) : (
              theirPosts.map((post) => (
                <motion.div
                  key={post._id}
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

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
                    <div className="flex items-center gap-1.5 text-white font-black text-sm">
                      <AiFillHeart size={18} className="text-rose-500" />
                      {post.likes?.length || 0}
                    </div>
                  </div>

                  {post.type === "reel" && (
                    <div className="absolute top-2 right-2 bg-zinc-950/80 border border-zinc-800/40 backdrop-blur-md rounded-lg px-2 py-0.5 text-[9px] font-black text-cyan-400 uppercase">
                      Reel
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default UserProfile;