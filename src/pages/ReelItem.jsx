import { useState, useEffect, useRef } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FiMessageCircle, FiShare2, FiBookmark, FiTrash2, FiUserCheck, FiUserPlus } from "react-icons/fi";
import { useReel } from "../context/ReelContext";
import toast from "react-hot-toast";
import CommentSheet from "../components/CommentSheet";
import { useComment } from "../context/CommentContext";
import { useFollow } from "../context/FollowContext"
import { useNavigate } from "react-router-dom";
const ReelItem = ({ post, muted, currentUserId, videoRef, isActive }) => {
    const author = post?.user;
  const isOwner = String(author?._id) === String(currentUserId);
  const {toggleFollow,isFollowing}=useFollow()
  const following=isFollowing(author?._id)
  const [showComments,setShowComments]=useState(false)
  const { handleLike, handleSave, handleDelete } = useReel();
  const {commentsByTarget,fetchComments}=useComment()

  const [liked, setLiked] = useState(() => post?.likes?.includes(currentUserId) || false);
  const [saved, setSaved] = useState(() => post?.saved?.includes(currentUserId) || false);
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);
  const [showHeart, setShowHeart] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const tapTimer = useRef(null);
  const tapCount = useRef(0);
  const menuRef = useRef(null);
const comments = commentsByTarget[`Reel_${post._id}`] || [];
const navigate=useNavigate()
  // feching comments on reels
useEffect(() => {
  fetchComments("Reel", post._id)  // was "Post"
}, [post._id])
  useEffect(() => {
    setLiked(post?.likes?.includes(currentUserId));
    setLikeCount(post?.likes?.length || 0);
    setSaved(post?.saved?.includes(currentUserId));
  }, [post?.likes, post?.saved, currentUserId]);

  //  Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLikeClick = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));
    handleLike(post._id);
  };

  const handleSaveClick = () => {
    setSaved((s) => !s);
    handleSave(post._id);
  };

  const handleDeleteClick = async () => {
    if (!window.confirm("Delete this reel?")) return;
    await handleDelete(post._id);
    setShowMenu(false);
  };

  const handleDoubleTap = () => {
    tapCount.current += 1;
    if (tapCount.current === 2) {
      tapCount.current = 0;
      clearTimeout(tapTimer.current);
      if (!liked) {
        setLiked(true);
        setLikeCount((c) => c + 1);
        handleLike(post._id);
      }
      setShowHeart(true);
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 600);
      setTimeout(() => setShowHeart(false), 900);
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 300);
    }
  };

  // ✅ Copy share link
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/reel/${post._id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  };

  const caption = post?.caption || "";

  return (
    <div className="relative w-full h-dvh snap-start snap-always flex items-center justify-center bg-black overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        src={post?.mediaUrl}
        className="absolute inset-0 w-full h-full object-cover"
        loop  
        playsInline
        muted={muted}
        onClick={handleDoubleTap}
      />

  
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* Double tap heart */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <AiFillHeart
            className={`text-white drop-shadow-[0_0_30px_rgba(239,68,68,0.9)] transition-all duration-500 ${
              heartAnim ? "scale-125 opacity-100" : "scale-50 opacity-0"
            }`}
            size={110}
          />
        </div>
      )}

      {/* ✅ Top right menu — only for owner */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20" ref={menuRef}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            ⋮
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-zinc-900 border border-white/10 rounded-lg overflow-hidden shadow-lg z-30">
              <button
                onClick={handleDeleteClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <FiTrash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Right sidebar */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-10">
        {/* Avatar */}
        <div className="p-0.5 rounded-full bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-900 border-2 border-black">
            <img
              src={author?.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${author?.userName}`}
              alt={author?.userName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Like */}
        <button
          onClick={handleLikeClick}
          className="flex flex-col items-center gap-1 transition-transform active:scale-75"
        >
          {liked ? (
            <AiFillHeart size={30} className="text-rose-400 drop-shadow-lg" />
          ) : (
            <AiOutlineHeart size={30} className="text-white drop-shadow-lg hover:text-rose-400 transition-colors" />
          )}
          <span className="text-white text-xs font-semibold drop-shadow">{likeCount}</span>
        </button>

        {/* Comment */}
<button
  onClick={() => setShowComments(true)}  
  className="flex flex-col items-center gap-1 transition-transform active:scale-75 hover:opacity-80"
>
  <FiMessageCircle size={28} className="text-white drop-shadow-lg" />
  <span className="text-white text-xs font-semibold drop-shadow">{comments?.length || 0}</span>
</button>

        {/* Save */}
        <button
          onClick={handleSaveClick}
          title={saved ? "Saved" : "Save"}
          aria-label={saved ? "Saved" : "Save"}
          className="flex flex-col items-center gap-1 transition-transform active:scale-75"
        >
          <FiBookmark
            size={27}
            fill={saved ? "currentColor" : "none"}
            className={`drop-shadow-lg transition-colors ${
              saved ? "text-fuchsia-400" : "text-white hover:text-fuchsia-400"
            }`}
          />
          <span className="text-[10px] text-zinc-300">{saved ? "Saved" : "Save"}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 transition-transform active:scale-75 hover:opacity-80"
        >
          <FiShare2 size={26} className="text-white drop-shadow-lg" />
        </button>
      </div>

      {/* Bottom — username + caption */}
      <div className="absolute bottom-24 left-4 right-16 z-10">
       <div className="flex gap-3 ">
        <p 
  onClick={() => navigate(isOwner ? "/profile" : `/profile/${author?._id}`)}
  className="text-white font-bold text-sm mb-1 drop-shadow cursor-pointer hover:underline"
>
  @{author?.userName || "unknown"}
</p>
        <div>
          {/* follow for reels */}
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
       </div>
        
        {caption && (
          <p className="text-zinc-200 text-xs leading-relaxed drop-shadow">
            {caption.length > 80 && !captionExpanded ? (
              <>
                {caption.slice(0, 80)}...{" "}
                <button
                  onClick={() => setCaptionExpanded(true)}
                  className="text-zinc-400 font-semibold hover:text-white transition-colors"
                >
                  more
                </button>
              </>
            ) : (
              caption
            )}
          </p>
          
        )}
        
      </div>
       <CommentSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        targetType="Reel"
        targetId={post._id}
      />
    </div>
  );
};

export default ReelItem;