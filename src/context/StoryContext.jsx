import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/AxiosInstance";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Wrap in useCallback to prevent infinite loops
  const fetchAllStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/story/getallstory");
      setStories(res.data.stories || []);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load stories";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - only created once

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchAllStories();
  }, [isLoggedIn, fetchAllStories]);

  const handleViewStory = useCallback(async (storyId) => {
    try {
      await axiosInstance.put(`/story/viewstory/${storyId}/view`);
      setStories((prev) =>
        prev.map((s) =>
          s._id === storyId
            ? {
                ...s,
                views: s.views.includes(user?._id)
                  ? s.views
                  : [...(s.views || []), user?._id],
              }
            : s
        )
      );
    } catch (err) {
      console.error("Failed to view story");
    }
  }, [user?._id]);

  const handleCreateStory = useCallback(
    async (file, caption = "", mediaType = "image") => {
      try {
        const formData = new FormData();
        formData.append("media", file);
        formData.append("text", caption);
        formData.append("mediaType", mediaType);
        const res = await axiosInstance.post("/story/createstory", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newStory = res.data.story;
        setStories((prev) => [newStory, ...prev]);
        toast.success("Story posted!");
        return newStory;
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to create story";
        toast.error(msg);
      }
    },
    []
  );

  const handleDeleteStory = useCallback(async (storyId) => {
    try {
      await axiosInstance.delete(`/story/deletestory/${storyId}`);
      setStories((prev) => prev.filter((s) => s._id !== storyId));
      toast.success("Story deleted");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to delete story";
      toast.error(msg);
    }
  }, []);

  return (
    <StoryContext.Provider
      value={{
        stories,
        error,
        loading,
        fetchAllStories,
        handleCreateStory,
        handleViewStory,
        handleDeleteStory,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => useContext(StoryContext);