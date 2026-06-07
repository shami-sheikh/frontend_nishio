import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStory } from "../context/StoryContext";
import StoryViewer from "./StoryViewer";
import { HiPlay } from "react-icons/hi";

const StoryCard = ({ story, allStories = [] }) => {
  const { user } = useAuth();
  const { handleViewStory, stories } = useStory();
  const [showViewer, setShowViewer] = useState(false);

  const storyAuthor = story?.user;
  const isVideo =
    story?.type === "video" || story?.mediaType === "video";

  // Only this author's stories
  const sourceList = allStories.length > 0 ? allStories : stories;
  const authorStories = sourceList.filter(
    (s) => String(s.user?._id) === String(storyAuthor?._id)
  );
  const initialIndex = authorStories.findIndex((s) => s._id === story._id);

  // Check if any of this author's stories are unviewed
  const hasUnviewed = authorStories.some(
    (s) => !s.views?.includes(user?._id)
  );

  const handleStoryClick = async () => {
    if (!story?.views?.includes(user?._id)) {
      await handleViewStory(story._id);
    }
    setShowViewer(true);
  };

  return (
    <>
      <div
        onClick={handleStoryClick}
        className="flex flex-col items-center gap-1.5 min-w-[4.5rem] cursor-pointer group"
      >
        <div
          className={`relative w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300 ${
            hasUnviewed
              ? "ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-[#080808] group-hover:ring-fuchsia-400"
              : "ring-2 ring-zinc-700 ring-offset-2 ring-offset-[#080808]"
          }`}
        >
          {/* Thumbnail */}
          {story?.mediaUrl && !isVideo ? (
            <img
              src={story.mediaUrl}
              alt={storyAuthor?.userName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="relative w-full h-full bg-zinc-900 ">
              <img
                src={
                  storyAuthor?.avatar ||
                  `https://api.dicebear.com/7.x/thumbs/svg?seed=${storyAuthor?.userName}`
                }
                alt={storyAuthor?.userName}
                className="w-full h-full object-cover opacity-70"
              />
              {/* {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                </div>
              )} */}
            </div>
          )}

          {/* Viewed dim */}
          {!hasUnviewed && (
            <div className="absolute inset-0 bg-black/30" />
          )}
        </div>

        <span
          className={`text-[10px] truncate w-16 text-center transition-colors ${
            hasUnviewed ? "text-zinc-400" : "text-zinc-600"
          }`}
        >
          {storyAuthor?.userName}
        </span>
      </div>

      {showViewer && (
        <StoryViewer
          story={story}
          onClose={() => setShowViewer(false)}
          allStories={authorStories}
          initialIndex={initialIndex >= 0 ? initialIndex : 0}
        />
      )}
    </>
  );
};

export default StoryCard;