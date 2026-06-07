import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/AxiosInstance";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const ReelContext = createContext();

const normalizeReel = (r) => ({
  _id: r._id,
  mediaUrl: r.videoUrl || r.mediaUrl || "",
  user: r.user,
  likes: r.likes || [],
  saved: r.saved || [],
  caption: r.caption || "",
  comments: r.comments || [],
});

export const ReelProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchReels();
  }, [isLoggedIn]);

  const fetchReels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/reels/allreels");
      const data = (res.data.reels || []).map(normalizeReel);
      setReels(data);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to load reels";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLike = async (id) => {
    try {
      const res = await axiosInstance.put(`/reels/togglereel/${id}/like`);
      const currentId = user?._id || user?.userId;
      setReels((prev) =>
        prev.map((r) =>
          r._id === id
            ? {
                ...r,
                likes:
                  res.data.message === "Liked"
                    ? [...(r.likes || []), currentId]
                    : (r.likes || []).filter((i) => i !== currentId),
              }
            : r,
        ),
      );
    } catch {
      toast.error("Failed to like reel");
    }
  };

  const handleSave = async (id) => {
  const currentId = user?._id || user?.userId;
  let savedNow = false;

  setReels((prev) =>
    prev.map((r) => {
      if (r._id !== id) return r;
      const saved = r.saved || [];
      const alreadySaved = saved.includes(currentId);
      savedNow = !alreadySaved;
      return {
        ...r,
        saved: alreadySaved
          ? saved.filter((i) => i !== currentId)
          : [...saved, currentId],
      };
    })
  );

  try {
    await axiosInstance.put(`/reels/togglereel/${id}/save`);
    toast.success(savedNow ? "Reel saved" : "Removed from saved");
  } catch {
    toast.error("Failed to save reel");
    
  }
};
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/reels/deletereel/${id}`);
      setReels((prev) => prev.filter((r) => r._id !== id));
      toast.success("Reel deleted");
    } catch {
      toast.error("Failed to delete reel");
    }
  };

  const addReel = (newReel) => {
  setReels((prev) => [normalizeReel(newReel), ...prev]);
};

  return (
    <ReelContext.Provider
      value={{
        reels,
        loading,
        fetchReels,
        handleLike,
        handleSave,
        handleDelete,
        addReel,
      }}
    >
      {children}
    </ReelContext.Provider>
  );
};

export const useReel = () => useContext(ReelContext);
