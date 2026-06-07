import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axiosInstance from "../api/AxiosInstance";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const { user, setUser, isLoggedIn } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/users/alluser");
      setAllUsers(res.data.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchAllUsers();
  }, [isLoggedIn, fetchAllUsers]);

  const toggleFollow = async (targetId) => {
    // ✅ Hard guards — never run with missing data
    if (!targetId || !user?._id) return;

    const currentId = user._id;

    const isAlreadyFollowing = (user.following || []).some(
      (id) => String(id) === String(targetId)
    );

    const updatedFollowing = isAlreadyFollowing
      ? (user.following || []).filter((id) => String(id) !== String(targetId))
      : [...(user.following || []), targetId];

    // ✅ Spread safely — user is guaranteed non-null here
    setUser({ ...user, following: updatedFollowing });

    setAllUsers((prev) =>
      prev.map((u) => {
        if (String(u._id) !== String(targetId)) return u;
        const alreadyFollower = (u.followers || []).some(
          (id) => String(id) === String(currentId)
        );
        return {
          ...u,
          followers: alreadyFollower
            ? (u.followers || []).filter((id) => String(id) !== String(currentId))
            : [...(u.followers || []), currentId],
        };
      })
    );

    try {
      await axiosInstance.put(`/users/${targetId}/follow`);
    } catch {
      toast.error("Failed to follow/unfollow");
      // ✅ Proper rollback
      setUser({ ...user, following: user.following || [] });
      fetchAllUsers();
    }
  };

  // ✅ Safe — never throws
  const isFollowing = (targetId) => {
    if (!targetId || !user?._id || !user?.following) return false;
    return user.following.some((id) => String(id) === String(targetId));
  };

  return (
    <FollowContext.Provider
      value={{
        allUsers,
        loading,
        fetchAllUsers,
        toggleFollow,
        isFollowing,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => useContext(FollowContext);