import { createContext, useContext, useState, useCallback } from "react";
import axiosInstance from "../api/AxiosInstance";
import toast from "react-hot-toast";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [stories, setStories] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/admin/stats");
      setStats(res.data.stats);
    } catch { toast.error("Failed to load stats"); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data.users);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/posts");
      setPosts(res.data.posts);
    } catch { toast.error("Failed to load posts"); }
    finally { setLoading(false); }
  }, []);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/reels");
      setReels(res.data.reels);
    } catch { toast.error("Failed to load reels"); }
    finally { setLoading(false); }
  }, []);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/stories");
      setStories(res.data.stories);
    } catch { toast.error("Failed to load stories"); }
    finally { setLoading(false); }
  }, []);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/comments");
      setComments(res.data.comments);
    } catch { toast.error("Failed to load comments"); }
    finally { setLoading(false); }
  }, []);

  const deleteUser = async (id) => {
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch { toast.error("Failed to delete user"); }
  };

  const toggleBan = async (id) => {
    try {
      const res = await axiosInstance.put(`/admin/users/${id}/ban`);
      setUsers((prev) => prev.map((u) =>
        u._id === id ? { ...u, isBanned: res.data.isBanned } : u
      ));
      toast.success(res.data.message);
    } catch { toast.error("Failed to update ban status"); }
  };

  const toggleAdmin = async (id) => {
    try {
      const res = await axiosInstance.put(`/admin/users/${id}/admin`);
      setUsers((prev) => prev.map((u) =>
        u._id === id ? { ...u, isAdmin: res.data.isAdmin } : u
      ));
      toast.success(res.data.message);
    } catch { toast.error("Failed to update admin status"); }
  };

  const deletePost = async (id) => {
    try {
      await axiosInstance.delete(`/admin/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Post deleted");
    } catch { toast.error("Failed to delete post"); }
  };

  const deleteReel = async (id) => {
    try {
      await axiosInstance.delete(`/admin/reels/${id}`);
      setReels((prev) => prev.filter((r) => r._id !== id));
      toast.success("Reel deleted");
    } catch { toast.error("Failed to delete reel"); }
  };

  const deleteStory = async (id) => {
    try {
      await axiosInstance.delete(`/admin/stories/${id}`);
      setStories((prev) => prev.filter((s) => s._id !== id));
      toast.success("Story deleted");
    } catch { toast.error("Failed to delete story"); }
  };

  const deleteComment = async (id) => {
    try {
      await axiosInstance.delete(`/admin/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
      toast.success("Comment deleted");
    } catch { toast.error("Failed to delete comment"); }
  };

  return (
    <AdminContext.Provider value={{
      stats, users, posts, reels, stories, comments, loading,
      fetchStats, fetchUsers, fetchPosts, fetchReels, fetchStories, fetchComments,
      deleteUser, toggleBan, toggleAdmin,
      deletePost, deleteReel, deleteStory, deleteComment,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);