import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axiosInstance from "../api/AxiosInstance";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [postsRes, storiesRes] = await Promise.all([
        axiosInstance.get("/posts/getallpost"),
        axiosInstance.get("/story/getallstory"),
      ]);
      setPosts(postsRes.data.posts || []);
      setStories(storiesRes.data.stories || []);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to load feed";
      setError(msg);
      const details = err?.response?.data?.extraDetails;
      toast.error(details ? `${msg}: ${details}` : msg);
    } finally {
      setLoading(false);
    }
  }, []);

  //  Single useEffect only
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchFeed();
  }, [isLoggedIn, fetchFeed]);

  const handleLike = async (postId) => {
    try {
      const res = await axiosInstance.put(`/posts/togglelike/${postId}/like`);
      const currentId = user?._id || user?.userId;
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes:
                  res.data.message === "Liked"
                    ? [...p.likes, currentId]
                    : p.likes.filter((id) => id !== currentId),
              }
            : p
        )
      );
    } catch {
      toast.error("Failed to like");
    }
  };

  const handleSave = async (postId) => {
    try {
      const res = await axiosInstance.put(`/posts/togglesave/${postId}/save`);
      const currentId = user?._id || user?.userId;
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                saved:
                  res.data.message === "Saved"
                    ? [...(p.saved || []), currentId]
                    : (p.saved || []).filter((id) => id !== currentId),
              }
            : p
        )
      );
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axiosInstance.delete(`/posts/deletepost/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const addPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        stories,
        error,
        loading,
        fetchFeed,
        handleLike,
        handleSave,
        handleDelete,
        addPost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);