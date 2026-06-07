import { useState, useEffect } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FiX, FiTrash2, FiEdit2, FiCornerDownRight } from "react-icons/fi";
import { useComment } from "../context/CommentContext";
import { useAuth } from "../context/AuthContext";

const CommentSheet = ({ isOpen, onClose, targetType, targetId }) => {
  const { user } = useAuth();
  // ✅ covers _id, id, userId
  const currentUserId = user?._id || user?.id || user?.userId;

  const {
    commentsByTarget, loading, fetchComments,
    addComment, deleteComment, editComment,
    likeComment, addReply, deleteReply, likeReply,
  } = useComment();

  const key = `${targetType}_${targetId}`;
  const comments = commentsByTarget[key] || [];

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    if (isOpen && targetId) fetchComments(targetType, targetId);
  }, [isOpen, targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addComment(targetType, targetId, text.trim());
    setText("");
  };

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return;
    await editComment(targetType, targetId, commentId, editText.trim());
    setEditingId(null);
    setEditText("");
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;
    await addReply(targetType, targetId, commentId, replyText.trim());
    setReplyingTo(null);
    setReplyText("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-t-3xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold text-sm">
            Comments <span className="text-zinc-500 font-normal">({comments.length})</span>
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 scrollbar-hide">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-3 bg-zinc-800 rounded animate-pulse" />
                    <div className="w-48 h-3 bg-zinc-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => {
              // ✅ compare as strings, both sides
              const isOwner = String(comment.user?._id) === String(currentUserId);
              const isLiked = comment.likes?.some((id) => String(id) === String(currentUserId));
              const repliesExpanded = expandedReplies[comment._id];

              return (
                <div key={comment._id} className="space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={comment.user?.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${comment.user?.userName}`}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-white text-xs font-semibold mr-2">
                            @{comment.user?.userName}
                          </span>
                          {editingId === comment._id ? (
                            <div className="mt-1 flex gap-2">
                              <input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-fuchsia-500/50"
                                autoFocus
                              />
                              <button onClick={() => handleEdit(comment._id)} className="text-fuchsia-400 text-xs font-semibold">Save</button>
                              <button onClick={() => setEditingId(null)} className="text-zinc-500 text-xs">Cancel</button>
                            </div>
                          ) : (
                            <span className="text-zinc-300 text-xs">{comment.text}</span>
                          )}
                        </div>

                        {/* Like comment */}
                        <button
                          onClick={() => likeComment(targetType, targetId, comment._id)}
                          className="flex flex-col items-center gap-0.5 shrink-0"
                        >
                          {isLiked
                            ? <AiFillHeart size={14} className="text-rose-400" />
                            : <AiOutlineHeart size={14} className="text-zinc-500" />
                          }
                          {comment.likes?.length > 0 && (
                            <span className="text-[10px] text-zinc-500">{comment.likes.length}</span>
                          )}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-zinc-600">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => { setReplyingTo(comment._id); setReplyText(""); }}
                          className="text-[10px] text-zinc-500 hover:text-white transition-colors font-medium"
                        >
                          Reply
                        </button>
                        {isOwner && (
                          <>
                            <button
                              onClick={() => { setEditingId(comment._id); setEditText(comment.text); }}
                              className="text-[10px] text-zinc-500 hover:text-fuchsia-400 transition-colors"
                            >
                              <FiEdit2 size={10} />
                            </button>
                            <button
                              onClick={() => deleteComment(targetType, targetId, comment._id)}
                              className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors"
                            >
                              <FiTrash2 size={10} />
                            </button>
                          </>
                        )}
                        {comment.replies?.length > 0 && (
                          <button
                            onClick={() => setExpandedReplies((p) => ({ ...p, [comment._id]: !p[comment._id] }))}
                            className="text-[10px] text-zinc-500 hover:text-white transition-colors"
                          >
                            {repliesExpanded ? "Hide" : `View ${comment.replies.length} replies`}
                          </button>
                        )}
                      </div>

                      {/* Reply input */}
                      {replyingTo === comment._id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to @${comment.user?.userName}...`}
                            className="flex-1 bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-fuchsia-500/50 placeholder-zinc-600"
                            autoFocus
                          />
                          <button onClick={() => handleReply(comment._id)} className="text-fuchsia-400 text-xs font-semibold">Send</button>
                          <button onClick={() => setReplyingTo(null)} className="text-zinc-500 text-xs">Cancel</button>
                        </div>
                      )}

                      {/* Replies */}
                      {repliesExpanded && comment.replies?.length > 0 && (
                        <div className="mt-3 space-y-3 pl-3 border-l border-white/5">
                          {comment.replies.map((reply) => {
                            // ✅ String comparison on both sides
                            const isReplyOwner = String(reply.user?._id) === String(currentUserId);
                            const isReplyLiked = reply.likes?.some((id) => String(id) === String(currentUserId));
                            return (
                              <div key={reply._id} className="flex gap-2">
                                <FiCornerDownRight size={12} className="text-zinc-700 shrink-0 mt-1" />
                                <img
                                  src={reply.user?.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${reply.user?.userName}`}
                                  className="w-6 h-6 rounded-full object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <span className="text-white text-xs font-semibold mr-2">@{reply.user?.userName}</span>
                                      <span className="text-zinc-300 text-xs">{reply.text}</span>
                                    </div>
                                    <button
                                      onClick={() => likeReply(targetType, targetId, comment._id, reply._id)}
                                      className="flex flex-col items-center gap-0.5 shrink-0"
                                    >
                                      {isReplyLiked
                                        ? <AiFillHeart size={12} className="text-rose-400" />
                                        : <AiOutlineHeart size={12} className="text-zinc-500" />
                                      }
                                      {reply.likes?.length > 0 && (
                                        <span className="text-[10px] text-zinc-500">{reply.likes.length}</span>
                                      )}
                                    </button>
                                  </div>
                                  {/* ✅ Delete button now shows correctly */}
                                  {isReplyOwner && (
                                    <button
                                      onClick={() => deleteReply(targetType, targetId, comment._id, reply._id)}
                                      className="mt-0.5 text-[10px] text-zinc-600 hover:text-rose-400 transition-colors"
                                    >
                                      <FiTrash2 size={10} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/thumbs/svg?seed=${user?.userName}`}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-zinc-800/80 text-white text-sm px-4 py-2 rounded-full border border-white/10 focus:outline-none focus:border-fuchsia-500/50 placeholder-zinc-600"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="text-fuchsia-400 font-semibold text-sm disabled:text-zinc-600 transition-colors"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentSheet;