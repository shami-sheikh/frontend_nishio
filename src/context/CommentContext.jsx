import { createContext, useContext, useState, useCallback } from "react";
import axiosInstance from "../api/AxiosInstance";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CommentContext = createContext();

export const CommentProvider = ({ children }) => {
  const { user } = useAuth();
  const [commentsByTarget, setCommentsByTarget] = useState({});
  const [loading, setLoading] = useState(false);

  const getKey = (targetType, targetId) => `${targetType}_${targetId}`;
  
  // ✅ Single helper — covers _id, id, userId
  const getCurrentId = () => user?._id || user?.id || user?.userId;

  const fetchComments = useCallback(async (targetType, targetId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/comments/getcommet/${targetType}/${targetId}`);
      setCommentsByTarget((prev) => ({
        ...prev,
        [getKey(targetType, targetId)]: res.data.comments || [],
      }));
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (targetType, targetId, text) => {
    try {
      const res = await axiosInstance.post(`/comments/createcomment/${targetType}/${targetId}`, { text });
      const newComment = res.data.comment;
      setCommentsByTarget((prev) => ({
        ...prev,
        [getKey(targetType, targetId)]: [newComment, ...(prev[getKey(targetType, targetId)] || [])],
      }));
      return newComment;
    } catch {
      toast.error("Failed to add comment");
    }
  }, []);

  const deleteComment = useCallback(async (targetType, targetId, commentId) => {
    try {
      await axiosInstance.delete(`/comments/deletecomment/comment/${commentId}`);
      setCommentsByTarget((prev) => ({
        ...prev,
        [getKey(targetType, targetId)]: (prev[getKey(targetType, targetId)] || []).filter(
          (c) => c._id !== commentId
        ),
      }));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  }, []);

  const editComment = useCallback(async (targetType, targetId, commentId, text) => {
    try {
      const res = await axiosInstance.put(`/comments/comment/${commentId}`, { text });
      setCommentsByTarget((prev) => ({
        ...prev,
        [getKey(targetType, targetId)]: (prev[getKey(targetType, targetId)] || []).map((c) =>
          c._id === commentId ? res.data.comment : c
        ),
      }));
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to edit comment");
    }
  }, []);

  const likeComment = useCallback(async (targetType, targetId, commentId) => {
    const currentId = getCurrentId(); // ✅
    setCommentsByTarget((prev) => ({
      ...prev,
      [getKey(targetType, targetId)]: (prev[getKey(targetType, targetId)] || []).map((c) => {
        if (c._id !== commentId) return c;
        const alreadyLiked = c.likes.includes(currentId);
        return {
          ...c,
          likes: alreadyLiked
            ? c.likes.filter((id) => id !== currentId)
            : [...c.likes, currentId],
        };
      }),
    }));
    try {
      await axiosInstance.put(`/comments/likecomment/comment/${commentId}/like`);
    } catch {
      toast.error("Failed to like comment");
    }
  }, [user]);

  const addReply = useCallback(async (targetType, targetId, commentId, text) => {
    try {
      const res = await axiosInstance.post(`/comments/replycomment/comment/${commentId}/reply`, { text });
      setCommentsByTarget((prev) => ({
        ...prev,
        [getKey(targetType, targetId)]: (prev[getKey(targetType, targetId)] || []).map((c) =>
          c._id === commentId ? res.data.comment : c
        ),
      }));
    } catch {
      toast.error("Failed to add reply");
    }
  }, []);

  const deleteReply = useCallback(async (targetType, targetId, commentId, replyId) => {
    try {
      await axiosInstance.delete(`/comments/deletereply/comment/${commentId}/reply/${replyId}`);
      setCommentsByTarget((prev) => ({
        ...prev,
        [getKey(targetType, targetId)]: (prev[getKey(targetType, targetId)] || []).map((c) =>
          c._id === commentId
            ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) }
            : c
        ),
      }));
      toast.success("Reply deleted");
    } catch {
      toast.error("Failed to delete reply");
    }
  }, []);

  const likeReply = useCallback(async (targetType, targetId, commentId, replyId) => {
    const currentId = getCurrentId(); // ✅
    setCommentsByTarget((prev) => ({
      ...prev,
      [getKey(targetType, targetId)]: (prev[getKey(targetType, targetId)] || []).map((c) => {
        if (c._id !== commentId) return c;
        return {
          ...c,
          replies: c.replies.map((r) => {
            if (r._id !== replyId) return r;
            const alreadyLiked = r.likes.includes(currentId);
            return {
              ...r,
              likes: alreadyLiked
                ? r.likes.filter((id) => id !== currentId)
                : [...r.likes, currentId],
            };
          }),
        };
      }),
    }));
    try {
      await axiosInstance.put(`/comments/likereply/comment/${commentId}/reply/${replyId}/like`);
    } catch {
      toast.error("Failed to like reply");
    }
  }, [user]);

  return (
    <CommentContext.Provider value={{
      commentsByTarget,
      loading,
      fetchComments,
      addComment,
      deleteComment,
      editComment,
      likeComment,
      addReply,
      deleteReply,
      likeReply,
    }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useComment = () => useContext(CommentContext);