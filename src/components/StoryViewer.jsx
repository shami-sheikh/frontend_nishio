import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiMessageCircle } from "react-icons/fi";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { HiEye } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";

const STORY_DURATION = 5000;

const StoryViewer = ({ story, onClose, allStories = [], initialIndex = 0 }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [videoDuration, setVideoDuration] = useState(STORY_DURATION);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const elapsedRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  const currentStory = allStories.length > 0 ? allStories[currentIndex] : story;
  const storyAuthor = currentStory?.user;
  const isOwner = String(storyAuthor?._id) === String(user?._id);
  const isVideo =
    currentStory?.type === "video" || currentStory?.mediaType === "video";

  const goNext = useCallback(() => {
    if (currentIndex < allStories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
      elapsedRef.current = 0;
    } else {
      onClose();
    }
  }, [currentIndex, allStories.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
      elapsedRef.current = 0;
    }
  }, [currentIndex]);

  useEffect(() => {
    setProgress(0);
    setLiked(false);
    elapsedRef.current = 0;
    startTimeRef.current = Date.now();
    if (!isVideo) setVideoDuration(STORY_DURATION);
  }, [currentIndex, isVideo]);

  useEffect(() => {
    if (isPaused) {
      clearInterval(intervalRef.current);
      return;
    }
    startTimeRef.current = Date.now() - elapsedRef.current;
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      elapsedRef.current = elapsed;
      const pct = Math.min((elapsed / videoDuration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current);
        goNext();
      }
    }, 16);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, videoDuration, goNext]);

  const handleVideoLoaded = () => {
    const vid = videoRef.current;
    if (vid && vid.duration && isFinite(vid.duration)) {
      setVideoDuration(vid.duration * 1000);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  const storiesToShow = allStories.length > 0 ? allStories : [story];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="absolute inset-0 bg-black/95" />

      <div
        className="relative w-full max-w-[420px] h-screen max-h-[100dvh] overflow-hidden flex flex-col bg-black shadow-2xl"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 px-3 pt-3">
          {storiesToShow.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[2.5px] rounded-full bg-white/25 overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                      ? `${progress}%`
                      : "0%",
                  transition: i === currentIndex ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-40 flex items-center gap-3 px-4 pt-1">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/40 ring-offset-1 ring-offset-black/60 flex-shrink-0">
            <img
              src={
                storyAuthor?.avatar ||
                `https://api.dicebear.com/7.x/thumbs/svg?seed=${storyAuthor?.userName}`
              }
              alt={storyAuthor?.userName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">
              {storyAuthor?.userName}
            </p>
            <p className="text-white/50 text-[11px]">
              {new Date(currentStory?.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {!isOwner && (
            <button className="px-3 py-1 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold rounded-full hover:bg-white/25 transition-all">
              Follow
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all flex-shrink-0"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Media */}
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          {isVideo ? (
            <video
              key={currentStory?._id}
              ref={videoRef}
              src={currentStory?.mediaUrl}
              className="w-full h-full object-contain"
              autoPlay
              // muted
              playsInline
              controls
              loop={false}
              onLoadedMetadata={handleVideoLoaded}
              onEnded={goNext}
              style={{ display: "block" }}
            />
          ) : (
            <img
              key={currentStory?._id}
              src={currentStory?.mediaUrl}
              alt="story"
              className="w-full h-full object-contain"
              draggable={false}
            />
          )}
        </div>

        {/* Gradients */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>

        {/* Tap zones */}
        <div className="absolute inset-0 z-20 flex">
          <div
            className="w-1/3 h-full"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          />
          <div className="w-1/3 h-full" />
          <div
            className="w-1/3 h-full"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
          />
        </div>

        {/* Caption */}
        {currentStory?.caption && (
          <div className="absolute bottom-28 left-4 right-4 z-30">
            <p className="text-white text-sm leading-relaxed drop-shadow-lg font-medium">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Non-owner actions */}
        {!isOwner && !showReplyInput && (
          <div className="absolute bottom-5 left-4 right-4 z-30 flex items-center gap-2">
            <button
              onClick={() => setShowReplyInput(true)}
              className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/60 text-sm hover:bg-white/15 transition-all"
            >
              <FiMessageCircle size={15} />
              <span>Reply...</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              {liked ? (
                <AiFillHeart size={18} className="text-rose-400" />
              ) : (
                <AiOutlineHeart size={18} className="text-white" />
              )}
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <HiEye size={14} className="text-white/60" />
              <span className="text-xs text-white/70 font-medium">
                {currentStory?.views?.length || 0}
              </span>
            </div>
          </div>
        )}

        {/* Reply input */}
        {!isOwner && showReplyInput && (
          <div className="absolute bottom-5 left-4 right-4 z-30 flex items-center gap-2">
            <input
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${storyAuthor?.userName}...`}
              className="flex-1 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-full text-white placeholder-white/40 text-sm outline-none focus:border-fuchsia-400/60 transition-all"
              onKeyDown={(e) => { if (e.key === "Escape") setShowReplyInput(false); }}
            />
            <button
              onClick={() => setShowReplyInput(false)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
            >
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* Owner stats */}
        {isOwner && (
          <div className="absolute bottom-5 left-4 right-4 z-30 flex items-center justify-between">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <HiEye size={15} className="text-white/70" />
              <span className="text-sm text-white font-semibold">
                {currentStory?.views?.length || 0}
              </span>
              <span className="text-xs text-white/50">views</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <AiOutlineHeart size={15} className="text-white/70" />
              <span className="text-sm text-white font-semibold">
                {currentStory?.reactions?.length || 0}
              </span>
              <span  className="text-xs text-white/50">likes</span>
            </div>
          </div>
        )}

        {/* Chevron nav */}
        {storiesToShow.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all"
              >
                <FiChevronLeft size={20} />
              </button>
            )}
            {currentIndex < storiesToShow.length - 1 && (
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all"
              >
                <FiChevronRight size={20} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;