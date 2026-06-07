import React, { useState, useEffect } from "react";
import { FiX, FiSearch } from "react-icons/fi";
import { HiPlay } from "react-icons/hi";
import { useStory } from "../context/StoryContext";
import { useAuth } from "../context/AuthContext";
import StoryViewer from "../components/StoryViewer";

function AllstoryModal({ showallstory, setseeallstory }) {
  const { stories } = useStory();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [viewerStory, setViewerStory] = useState(null);
  const [viewerAllStories, setViewerAllStories] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (showallstory) {
      setTimeout(() => setMounted(true), 10);
    } else {
      setMounted(false);
    }
  }, [showallstory]);

  if (!showallstory) return null;

  // Group stories by user
  const groupedByUser = stories.reduce((acc, story) => {
    const uid = story.user?._id;
    if (!uid) return acc;
    if (!acc[uid]) acc[uid] = { user: story.user, stories: [] };
    acc[uid].stories.push(story);
    return acc;
  }, {});

  const userGroups = Object.values(groupedByUser).filter((g) =>
    g.user?.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStoryClick = (story, groupStories) => {
    const idx = groupStories.findIndex((s) => s._id === story._id);
    setViewerAllStories(groupStories);   // ✅ only this user's stories
    setViewerIndex(idx >= 0 ? idx : 0);
    setViewerStory(story);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={setseeallstory}
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.25s ease" }}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[88vh] flex flex-col"
        style={{
          transform: mounted ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <div className="mx-auto w-full max-w-lg bg-[#111] rounded-t-3xl border border-white/8 flex flex-col overflow-hidden shadow-2xl">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-2 pb-4 flex-shrink-0">
            <div>
              <h2 className="text-white font-bold text-lg tracking-tight">
                All Stories
              </h2>
              <p className="text-zinc-500 text-xs mt-0.5">
                {stories.length} {stories.length === 1 ? "story" : "stories"} ·{" "}
                {userGroups.length} {userGroups.length === 1 ? "person" : "people"}
              </p>
            </div>
            <button
              onClick={setseeallstory}
              className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/15 transition-all"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 pb-4 flex-shrink-0">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl">
              <FiSearch size={14} className="text-zinc-500 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people..."
                className="bg-transparent text-white text-sm placeholder-zinc-600 outline-none flex-1 min-w-0"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-zinc-600 hover:text-zinc-400"
                >
                  <FiX size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="h-px bg-white/5 flex-shrink-0" />

          {/* List */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
            {userGroups.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-zinc-600 text-sm">
                  {search ? "No users match your search" : "No stories yet"}
                </p>
              </div>
            ) : (
              userGroups.map((group) => {
                const hasUnviewed = group.stories.some(
                  (s) => !s.views?.includes(user?._id)
                );
                return (
                  <div key={group.user._id}>
                    {/* User row */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-[#111] flex-shrink-0 ${
                          hasUnviewed ? "ring-fuchsia-500" : "ring-zinc-700"
                        }`}
                      >
                        <img
                          src={
                            group.user.avatar ||
                            `https://api.dicebear.com/7.x/thumbs/svg?seed=${group.user.userName}`
                          }
                          alt={group.user.userName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {group.user.userName}
                        </p>
                        <p className="text-zinc-600 text-xs">
                          {group.stories.length}{" "}
                          {group.stories.length === 1 ? "story" : "stories"}
                        </p>
                      </div>
                      {hasUnviewed && (
                        <span className="px-2 py-0.5 bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-400 text-[10px] font-semibold rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {group.stories.map((story) => {
                        const isViewed = story.views?.includes(user?._id);
                        const isVideo =
                          story.type === "video" || story.mediaType === "video";
                        return (
                          <button
                            key={story._id}
                            onClick={() =>
                              handleStoryClick(story, group.stories)
                            }
                            className={`relative flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden border transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${
                              isViewed
                                ? "border-white/10 opacity-60"
                                : "border-fuchsia-500/40 shadow-[0_0_12px_rgba(217,70,239,0.15)]"
                            }`}
                          >
                            {!isVideo && story.mediaUrl ? (
                              <img
                                src={story.mediaUrl}
                                alt="story"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-900 flex items-center justify-center relative">
                                <img
                                  src={
                                    group.user.avatar ||
                                    `https://api.dicebear.com/7.x/thumbs/svg?seed=${group.user.userName}`
                                  }
                                  alt=""
                                  className="w-full h-full object-cover opacity-50"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                    <HiPlay size={14} className="text-white ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                            <div className="absolute bottom-1.5 left-0 right-0 px-1.5">
                              <p className="text-white/70 text-[9px] text-center font-medium">
                                {new Date(story.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </p>
                            </div>

                            {!isViewed && (
                              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_6px_rgba(217,70,239,0.8)]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
            <div className="h-4" />
          </div>
        </div>
      </div>

      {/* Viewer — only this user's stories */}
      {viewerStory && (
        <div style={{ zIndex: 60 }} className="fixed inset-0">
          <StoryViewer
            story={viewerStory}
            onClose={() => setViewerStory(null)}
            allStories={viewerAllStories}
            initialIndex={viewerIndex}
          />
        </div>
      )}
    </>
  );
}

export default AllstoryModal;