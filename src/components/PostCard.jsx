import { useState, useRef, useEffect } from "react";
import {
  FiBookmark, FiMoreHorizontal, FiTrash2,
  FiMessageCircle, FiShare2, FiUserPlus, FiUserCheck,
} from "react-icons/fi";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import CommentSheet from "./CommentSheet";
import { useComment } from "../context/CommentContext";
import { useFollow } from "../context/FollowContext";
import toast from "react-hot-toast";
import { NavLink, useNavigate } from "react-router-dom";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const isVideoUrl = (url) =>
  /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(url || "");

const PostCard = ({ post, currentUserId, onLike, onSave, onDelete, index }) => {
  const navigate=useNavigate()
  const author = post?.user;
  const isOwner = String(author?._id) === String(currentUserId);

  const { toggleFollow, isFollowing } = useFollow();
  const following = isFollowing(author?._id);

  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(() => post?.likes?.includes(currentUserId) || false);
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);
  const [saved, setSaved] = useState(() => post?.saved?.includes(currentUserId) || false);
  const [showHeart, setShowHeart] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const { commentsByTarget, fetchComments } = useComment();
  const comments = commentsByTarget[`Post_${post._id}`] || post?.comments || [];

  const tapTimer = useRef(null);
  const tapCount = useRef(0);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchComments("Post", post._id);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setLiked(post?.likes?.includes(currentUserId) || false);
    setLikeCount(post?.likes?.length || 0);
    setSaved(post?.saved?.includes(currentUserId) || false);
  }, [post?.likes, post?.saved, currentUserId]);

  const handleLikeClick = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));
    onLike(post._id);
  };

  const handleSaveClick = () => {
    setSaved((s) => !s);
    onSave(post._id);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  };

  const handleDoubleTap = () => {
    tapCount.current += 1;
    if (tapCount.current === 2) {
      tapCount.current = 0;
      clearTimeout(tapTimer.current);
      if (!liked) {
        setLiked(true);
        setLikeCount((c) => c + 1);
        onLike(post._id);
      }
      setShowHeart(true);
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 600);
      setTimeout(() => setShowHeart(false), 900);
    } else {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 300);
    }
  };

  const caption = post?.caption || "";
  const isLongCaption = caption.length > 100;
  const isVideo =
    isVideoUrl(post?.mediaUrl) ||
    post?.mediaType === "video" ||
    post?.type === "video" ||
    post?.type === "reel";

  return (
    <article
      className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
        <div 
  onClick={() => navigate(isOwner ? "/profile" : `/profile/${author?._id}`)}
  className="cursor-pointer"
>
  <div className="p-0.5 rounded-2xl bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 shrink-0">
    <div className="w-10 h-10 rounded-[14px] overflow-hidden bg-zinc-900">
      <img
        src={author?.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${author?.userName}`}
        alt={author?.userName}
        className="w-full h-full object-cover"
      />
    </div>
  </div>
</div>

          {/* Name + time */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {author?.userName || "Unknown"}
            </p>
            <p className="text-[10px] text-zinc-500">{timeAgo(post?.createdAt)}</p>
          </div>

          {/*  Follow button — only show for other users */}
          {!isOwner && (
            <button
              onClick={() => toggleFollow(author?._id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 shrink-0 ${
                following
                  ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  : "bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30 hover:bg-fuchsia-600/30"
              }`}
            >
              {following ? (
                <><FiUserCheck size={11} /> Following</>
              ) : (
                <><FiUserPlus size={11} /> Follow</>
              )}
            </button>
          )}
        </div>

        {/* Delete menu — only for owner */}
        {isOwner && (
          <div className="relative ml-2" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
            >
              <FiMoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30">
                <button
                  onClick={() => {
                    onDelete(post._id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <FiTrash2 size={14} />
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media */}
      {post?.mediaUrl && (
        <div
          className="relative overflow-hidden select-none"
          onClick={!isVideo ? handleDoubleTap : undefined}
        >
          {isVideo ? (
            <video
              src={post.mediaUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full max-h-130 bg-black"
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt={caption || "post"}
              className="w-full max-h-130 object-cover cursor-pointer"
            />
          )}

          {!isVideo && showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <AiFillHeart
                className={`text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] transition-all duration-500 ${
                  heartAnim ? "scale-125 opacity-100" : "scale-50 opacity-0"
                }`}
                size={96}
              />
            </div>
          )}

          {!isVideo && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900/60 to-transparent pointer-events-none" />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Like */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 active:scale-90 ${
                liked
                  ? "bg-rose-500/15 text-rose-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {liked ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
              <span className="text-xs font-semibold">{likeCount}</span>
            </button>

            {/* Comment */}
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all duration-200 active:scale-90"
            >
              <FiMessageCircle size={20} />
              <span className="text-xs font-semibold">{comments.length}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
            >
              <FiShare2 size={17} />
            </button>
          </div>

          {/* Save */}
          <button
            onClick={handleSaveClick}
            title={saved ? "Saved" : "Save"}
            aria-label={saved ? "Saved" : "Save"}
            className={`p-2 rounded-xl transition-all duration-200 active:scale-90 ${
              saved
                ? "text-fuchsia-400 bg-fuchsia-500/10"
                : "text-zinc-400 hover:text-fuchsia-400 hover:bg-white/5"
            }`}
          >
            <FiBookmark size={19} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <div className="px-4 pb-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            <span className="font-bold text-white mr-1.5">{author?.userName}</span>
            {isLongCaption && !captionExpanded ? (
              <>
                {caption.slice(0, 100)}...{" "}
                <button
                  onClick={() => setCaptionExpanded(true)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  more
                </button>
              </>
            ) : (
              caption
            )}
          </p>
        </div>
      )}

      <CommentSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        targetType="Post"
        targetId={post._id}
      />
    </article>
  );
};

export default PostCard;