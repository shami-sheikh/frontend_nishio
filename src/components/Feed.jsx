import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePost } from "../context/PostContext";
import { useStory } from "../context/StoryContext";
import StoryCard from "./StoryCard";
import SkeletonCard from "./SkeletonCard";
import PostCard from "./PostCard";
import Navbar from "../pages/Navbar";
import AddStoryModal from "../models/AddStoryModal";
import AllstoryModal from "../models/AllstoryModal";
import { NavLink, useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import NotificationPanel from "./NotificationPanel";

const Feed = () => {
  const { user } = useAuth();
  const { posts, loading, error, fetchFeed, handleLike, handleSave, handleDelete } = usePost();
  const { stories, fetchAllStories } = useStory();
  const [showAddStory, setShowAddStory] = useState(false);
  const [showallstory, setseeallstory] = useState(false);
const navigate=useNavigate()
  useEffect(() => {
    fetchAllStories();
  }, [fetchAllStories]);

  // ✅ One card per user — show their latest story as the card
  const uniqueUserStories = stories.reduce((acc, story) => {
    const uid = story.user?._id;
    if (!uid) return acc;
    const already = acc.find((s) => String(s.user?._id) === String(uid));
    if (!already) acc.push(story);
    return acc;
  }, []);
const [showNotifications, setShowNotifications] = useState(false);
const { unreadCount } = useNotification();
  return (
    <div>
      <div className="min-h-screen bg-[#080808]">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5 px-5 py-3 flex items-center justify-between">
          <h1 className="md:text-xl text-sm font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400">
            Nishiogram
          </h1>
          <div className="flex items-center gap-3">
            <h3 className="md:text-sm text-xs font-medium text-zinc-400">
              Hi,{" "}
              <span className="text-zinc-100 font-semibold">
                {user?.userName || "Guest"}
              </span>
            </h3>

            {/* feed notification btn */}
          <div className="relative">
  <button
    onClick={() => setShowNotifications((v) => !v)}
    className="relative p-2 rounded-xl hover:bg-zinc-900/50 text-zinc-400 hover:text-white transition-colors"
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
    {unreadCount > 0 && (
      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-fuchsia-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    )}
  </button>
  {showNotifications && (
    <NotificationPanel onClose={() => setShowNotifications(false)} />
  )}
</div>
            {/* feed profile logo  */}
           <NavLink to={"/profile"}>
             <div className="relative" >
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-fuchsia-500/60 ring-offset-2 ring-offset-[#080808]">
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.userName}`
                  }
                  alt={user?.userName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080808]" />
            </div>
           </NavLink>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 pb-28 pt-5 ">
          {/* Stories */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
                Stories
              </span>
              <button
                onClick={() => setseeallstory(true)}
                className="text-xs text-fuchsia-400 font-medium hover:text-fuchsia-300 transition-colors"
              >
                See all
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {/* Add Story */}
              <div
                onClick={() => setShowAddStory(true)}
                className="flex flex-col items-center gap-2 min-w-[4.5rem] cursor-pointer"
              >
                <div className="w-16 h-16  rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <svg
                    className="w-6 h-6 text-zinc-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="text-[10px] text-zinc-500 truncate w-16 text-center">
                  Add
                </span>
              </div>

              {/* ✅ One card per user */}
              {uniqueUserStories.length > 0 ? (
                uniqueUserStories.map((story) => (
                  <StoryCard
                    key={story.user?._id}
                    story={story}
                    allStories={stories}
                  />
                ))
              ) : (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 min-w-[4.5rem]"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 animate-pulse" />
                    <div className="w-10 h-2 bg-zinc-900 rounded animate-pulse" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-7 px-1">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
              For you
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Posts */}
          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-red-500/5 border border-red-500/30 p-6 text-center space-y-3">
              <p className="text-red-300 font-semibold">{error}</p>
              <button
                onClick={() => fetchFeed()}
                className="px-4 py-2 bg-red-600/80 rounded-lg text-white font-medium hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-white font-semibold text-lg mb-1">
                Nothing here yet
              </p>
              <p className="text-zinc-500 text-sm">
                Follow people or share your first post
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post, idx) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={user?._id || user?.id}
                  onLike={handleLike}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>

        <Navbar />
      </div>

      <AddStoryModal
        isOpen={showAddStory}
        onClose={() => setShowAddStory(false)}
      />
      <AllstoryModal
        showallstory={showallstory}
        setseeallstory={() => setseeallstory(false)}
      />
    </div>
  );
};

export default Feed;