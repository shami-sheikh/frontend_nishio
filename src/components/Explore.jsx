import { useState } from "react";
import { FiSearch, FiUserPlus, FiUserCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useFollow } from "../context/FollowContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../pages/Navbar";

const Explore = () => {
  const { user } = useAuth();
  const { allUsers, loading, toggleFollow, isFollowing } = useFollow();
  const [query, setQuery] = useState("");

  const filtered = allUsers.filter((u) =>
    u.userName?.toLowerCase().includes(query.toLowerCase()) ||
    u.bio?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050506] text-white pb-32">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#050506]/80 backdrop-blur-xl border-b border-zinc-900 px-5 py-4">
        <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent mb-4">
          Explore
        </h1>
        <div className="flex items-center max-w-md mx-auto gap-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-3">
          <FiSearch size={16} className="text-zinc-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people..."
            className="flex-1 bg-transparent mx-auto max-w-sm text-sm text-white placeholder-zinc-600 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-zinc-500 hover:text-white text-xs transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-3">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 animate-pulse"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-28 h-3 bg-zinc-800 rounded" />
                <div className="w-44 h-3 bg-zinc-800 rounded" />
              </div>
              <div className="w-20 h-8 bg-zinc-800 rounded-xl" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 font-bold">No users found</p>
            <p className="text-zinc-600 text-sm mt-1">Try a different search</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((u, i) => {
              const following = isFollowing(u._id);
              return (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 transition-colors"
                >
                  {/* Avatar */}
                  <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-violet-500 to-cyan-400 shrink-0">
                    <div className="w-12 h-12 rounded-[14px] overflow-hidden bg-zinc-950">
                      <img
                        src={
                          u.avatar ||
                          `https://api.dicebear.com/7.x/thumbs/svg?seed=${u.userName}`
                        }
                        alt={u.userName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      @{u.userName}
                    </p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {u.bio || "No bio yet"}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {u.followers?.length || 0} followers
                    </p>
                  </div>

                  {/* Follow button */}
                  <button
                    onClick={() => toggleFollow(u._id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 active:scale-95 ${
                      following
                        ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                        : "bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-950/30"
                    }`}
                  >
                    {following ? (
                      <><FiUserCheck size={13} /> Following</>
                    ) : (
                      <><FiUserPlus size={13} /> Follow</>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <Navbar />
    </div>
  );
};

export default Explore;