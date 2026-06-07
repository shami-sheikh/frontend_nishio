import { useEffect, useState } from "react";
import axiosInstance from "../../api/AxiosInstance";
import { FiTrash2, FiShield, FiShieldOff, FiStar } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Users = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axiosInstance.get("/admin/users")
      .then((res) => setUsers(res.data.users || []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const toggleBan = async (id) => {
    try {
      const res = await axiosInstance.put(`/admin/users/${id}/ban`);
      setUsers((prev) =>
        prev.map((u) => u._id === id ? { ...u, isBanned: res.data.isBanned } : u)
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const toggleAdmin = async (id) => {
    try {
      const res = await axiosInstance.put(`/admin/users/${id}/admin`);
      setUsers((prev) =>
        prev.map((u) => u._id === id ? { ...u, isAdmin: res.data.isAdmin } : u)
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const filtered = users.filter((u) =>
    u.userName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">
          Users{" "}
          <span className="text-zinc-500 font-normal text-base">
            ({users.length})
          </span>
        </h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-fuchsia-500/50 w-48"
        />
      </div>

      {/* List */}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="font-bold">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => {
            const isSuper = u.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL;
            const isSelf = String(u._id) === String(currentUser?._id);

            return (
              <div
                key={u._id}
                className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-colors"
              >
                {/* Avatar */}
                <img
                  src={
                    u.avatar ||
                    `https://api.dicebear.com/7.x/thumbs/svg?seed=${u.userName}`
                  }
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                  alt={u.userName}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">@{u.userName}</p>
                    {isSuper && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5 font-bold">
                        ⭐ Super Admin
                      </span>
                    )}
                    {!isSuper && u.isAdmin && (
                      <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/20 rounded-full px-2 py-0.5 font-bold">
                        Admin
                      </span>
                    )}
                    {u.isBanned && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-full px-2 py-0.5 font-bold">
                        Banned
                      </span>
                    )}
                    {isSelf && (
                      <span className="text-[10px] bg-zinc-700/50 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5 font-bold">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {u.followers?.length || 0} followers ·{" "}
                    {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isSuper ? (
                    // Super admin — no actions
                    <span className="text-[10px] text-zinc-600 italic px-2">
                      Protected
                    </span>
                  ) : (
                    <>
                      {/* Ban / Unban — not yourself */}
                      {!isSelf && (
                        <ActionBtn
                          onClick={() => toggleBan(u._id)}
                          color={u.isBanned ? "emerald" : "rose"}
                          title={u.isBanned ? "Unban user" : "Ban user"}
                        >
                          {u.isBanned
                            ? <FiShield size={14} />
                            : <FiShieldOff size={14} />
                          }
                        </ActionBtn>
                      )}

                      {/* Promote / Demote — only super admin can do this */}
                      {isSuperAdmin && !isSelf && (
                        <ActionBtn
                          onClick={() => toggleAdmin(u._id)}
                          color="fuchsia"
                          title={u.isAdmin ? "Demote from admin" : "Promote to admin"}
                        >
                          <FiStar size={14} />
                        </ActionBtn>
                      )}

                      {/* Delete — not yourself, not super admin */}
                      {!isSelf && (
                        <ActionBtn
                          onClick={() => deleteUser(u._id)}
                          color="rose"
                          title="Delete user"
                        >
                          <FiTrash2 size={14} />
                        </ActionBtn>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Action Button ──
const ActionBtn = ({ onClick, color, title, children }) => {
  const colors = {
    rose:    "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
    fuchsia: "bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-xl transition-all ${colors[color]}`}
    >
      {children}
    </button>
  );
};

// ── Skeleton ──
const Skeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl animate-pulse"
      >
        <div className="w-10 h-10 rounded-xl bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="w-32 h-3 bg-zinc-800 rounded" />
          <div className="w-48 h-3 bg-zinc-800 rounded" />
          <div className="w-24 h-2 bg-zinc-800 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-zinc-800 rounded-xl" />
          <div className="w-8 h-8 bg-zinc-800 rounded-xl" />
          <div className="w-8 h-8 bg-zinc-800 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

export default Users;